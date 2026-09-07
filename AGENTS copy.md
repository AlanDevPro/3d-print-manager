create or replace function public.verificar_pago_pedido(p_pedido_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_pago_id uuid;
  v_pago_monto numeric;
  v_metodo text;
  v_pago_total numeric;
  v_anticipo_pct numeric;
  v_empresa_id uuid;
  v_cliente_id uuid;
  v_producto_id uuid;
  v_estado_actual text;
  v_total_cobrado numeric;
begin
  -- 1. Obtener datos del pedido
  select pago_total, pago_anticipo_pct, empresa_id, cliente_id, producto_id, estado
  into v_pago_total, v_anticipo_pct, v_empresa_id, v_cliente_id, v_producto_id, v_estado_actual
  from pedidos
  where id = p_pedido_id;

  if coalesce(v_pago_total, 0) <= 0 then
    raise exception 'No se puede verificar el pago porque el monto total del pedido es 0 o inválido.';
  end if;

  -- 2. Obtener el último pago PENDIENTE de verificación
  select id, monto, metodo 
  into v_pago_id, v_pago_monto, v_metodo
  from pedido_pagos
  where pedido_id = p_pedido_id and verificado = false
  order by created_at desc
  limit 1;

  if v_pago_id is null then
    raise exception 'No existe un pago pendiente de verificación para este pedido.';
  end if;

  if coalesce(v_pago_monto, 0) <= 0 then
    raise exception 'El monto del pago registrado es inválido o no puede ser cero.';
  end if;

  -- 3. Marcar SOLO este pago como verificado (Mantiene su monto original registrado)
  update pedido_pagos
  set verificado = true
  where id = v_pago_id;

  -- 4. Calcular el monto total realmente cobrado (verificado) acumulado
  select coalesce(sum(monto), 0)
  into v_total_cobrado
  from pedido_pagos
  where pedido_id = p_pedido_id and verificado = true;

  -- 5. Actualizar estado del Pedido según lo cobrado acumulado
  update pedidos
  set pago_estado = case 
        when v_total_cobrado >= v_pago_total then 'pagado'
        when v_total_cobrado > 0 then 'anticipo'
        else 'pendiente'
      end,
      pago_monto_cobrado = v_total_cobrado,
      estado = case when v_estado_actual = 'pendiente' then 'en_impresion' else v_estado_actual end,
      updated_at = now()
  where id = p_pedido_id;

  -- 6. Evento de historial registrando el monto REAL del pago
  insert into pedido_eventos (pedido_id, texto)
  values (
    p_pedido_id,
    format('Pago/Anticipo de %s Bs verificado vía %s. Pedido movido a producción.', v_pago_monto, coalesce(v_metodo, 'efectivo'))
  );

  -- 7. Marcar el primer ítem del checklist como hecho si sigue pendiente
  update pedido_checklist_items
  set hecho = true
  where id = (
    select id from pedido_checklist_items
    where pedido_id = p_pedido_id and hecho = false
    order by orden asc
    limit 1
  );

  -- 8. Ingreso contable con el monto REAL de este pago
  insert into ingresos (pedido_id, cliente_id, producto_id, concepto, monto, metodo, fecha, empresa_id)
  values (
    p_pedido_id, v_cliente_id, v_producto_id,
    'Anticipo/Pago de pedido verificado', v_pago_monto, coalesce(v_metodo, 'efectivo'), current_date, v_empresa_id
  );
end;
$$;