-- Extensiones necesarias (una sola vez por proyecto)
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Columnas de control de tiempo en pedidos
alter table pedidos
  add column if not exists fecha_inicio_impresion timestamptz,
  add column if not exists fecha_estimada_listo timestamptz,
  add column if not exists horas_impresion_estimadas numeric;

-- Tabla de tokens push (uno o más por usuario/empresa)
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  empresa_id uuid not null references empresas(id) on delete cascade,
  expo_push_token text not null unique,
  created_at timestamptz not null default now()
);
alter table push_tokens enable row level security;
create policy "usuarios ven sus propios tokens"
  on push_tokens for all
  using (auth.uid() = user_id);

-- 1) Función: suma horas de impresión de la cotización del pedido
create or replace function fn_calcular_horas_impresion(p_pedido_id uuid)
returns numeric
language sql
stable
as $$
  select coalesce(sum(ci.tiempo_impresion_horas), 0)
  from pedidos p
  join cotizacion_items ci on ci.cotizacion_id = p.cotizacion_id
  where p.id = p_pedido_id;
$$;

-- 2) Trigger: al entrar a en_impresion, arma el temporizador
create or replace function fn_iniciar_temporizador_pedido()
returns trigger
language plpgsql
as $$
declare
  v_horas numeric;
begin
  if new.estado = 'en_impresion' and (old.estado is distinct from 'en_impresion') then
    v_horas := fn_calcular_horas_impresion(new.id);

    new.horas_impresion_estimadas := v_horas;
    new.fecha_inicio_impresion := now();
    new.fecha_estimada_listo := now()
        + interval '5 minutes'
        + make_interval(secs => v_horas * 3600);

    insert into pedido_eventos (pedido_id, texto)
    values (
      new.id,
      format('Impresión iniciada. Tiempo estimado: %s h (margen 15 min incluido). Listo aprox: %s',
             round(v_horas, 2), to_char(new.fecha_estimada_listo, 'DD/MM HH24:MI'))
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_iniciar_temporizador_pedido on pedidos;
create trigger trg_iniciar_temporizador_pedido
  before update on pedidos
  for each row
  execute function fn_iniciar_temporizador_pedido();

-- 3) Función que el cron ejecuta cada minuto: cierra pedidos vencidos y notifica
create or replace function fn_verificar_pedidos_listos()
returns void
language plpgsql
as $$
declare
  r record;
  v_tokens text[];
begin
  for r in
    select id, empresa_id, codigo_pedido
    from pedidos
    where estado = 'en_impresion'
      and fecha_estimada_listo is not null
      and fecha_estimada_listo <= now()
  loop
    update pedidos set estado = 'listo' where id = r.id;

    insert into pedido_eventos (pedido_id, texto)
    values (r.id, 'Impresión finalizada. Pedido listo para entrega.');

    update pedido_checklist_items
      set hecho = true
      where pedido_id = r.id and orden = (
        select min(orden) from pedido_checklist_items pci2
        where pci2.pedido_id = r.id and pci2.hecho = false
      );

    select array_agg(expo_push_token) into v_tokens
    from push_tokens
    where empresa_id = r.empresa_id;

    if v_tokens is not null and array_length(v_tokens, 1) > 0 then
      perform net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
          'to', v_tokens,
          'title', 'Pedido listo 🎉',
          'body', format('El pedido #%s ya está listo para entrega.', r.codigo_pedido),
          'sound', 'default'
        )
      );
    end if;
  end loop;
end;
$$;

-- 4) Cron: corre cada minuto
select cron.schedule(
  'verificar-pedidos-listos',
  '* * * * *',
  $$ select fn_verificar_pedidos_listos(); $$
);