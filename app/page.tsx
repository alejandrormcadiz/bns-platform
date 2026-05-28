/*
  BNS™ C-LEVEL ENTERPRISE FULL VERSION
  Archivo completo para reemplazar app/page.tsx.
  Conserva: Supabase, Auth, Realtime, Groq, FODA, Heatmap, Neural Map,
  Organizational Drilldown, Revenue Forecast, Pressure, PDF y módulos existentes.
*/
"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { supabase } from "../src/lib/supabaseClient";

type Tab =
  | "cuenta"
  | "entrada"
  | "centro"
  | "operaciones"
  | "revenue"
  | "clientes"
  | "acciones"
  | "importador"
  | "executive"
  | "forecast"
  | "pressure"
  | "digital"
  | "liderazgo"
  | "senales"
  | "sitio"
  | "redes"
  | "whatsapp"
  | "diagnostico"
  | "intelligence"
  | "crisis"
  | "permisos"
  | "legal"
  | "strategic"
  | "memory"
  | "boardroom"
  | "integrations"
  | "mobile"
  | "audit"
  | "organization";

type Rol = "Owner" | "Admin" | "Manager" | "Analyst" | "Viewer";

type Departamento =
  | "Dirección General"
  | "Finanzas / CFO"
  | "Comercial"
  | "Operaciones"
  | "Marketing"
  | "Soporte"
  | "Recursos Humanos"
  | "Tecnología / Sistemas"
  | "Legal / Compliance"
  | "Analítica / BI"
  | "Otro";

type Usuario = {
  nombre: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: Departamento;
  rol: Rol;
};

type Empresa = {
  nombre: string;
  giro: string;
  sitio: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tamano: string;
  objetivo: string;
  responsable: string;
};


type EmpresaWorkspace = {
  id: string;
  nombre: string;
  giro: string;
  sitio: string;
  responsable: string;
  objetivo: string;
  created_at?: string;
};

type Miembro = {
  nombre: string;
  email: string;
  rol: Rol;
  estado: string;
};


type AuditEvent = {
  id: string;
  hora: string;
  usuario: string;
  rol: Rol;
  tipo: "Sistema" | "Seguridad" | "Datos" | "IA" | "PDF" | "Navegación" | "Gobernanza";
  accion: string;
  descripcion: string;
  severidad: "Alta" | "Media" | "Baja";
};


type LiveEvent = {
  id: string;
  hora: string;
  tipo: "Realtime" | "Data" | "AI" | "Boardroom" | "Security" | "System";
  titulo: string;
  descripcion: string;
  severidad: "Alta" | "Media" | "Baja";
  workspace: string;
};


type EtapaLead = "Nuevo" | "Contactado" | "Propuesta" | "Negociación" | "Ganado" | "Perdido";
type TemperaturaLead = "Caliente" | "Tibio" | "Frío";
type RiesgoLead = "Bajo" | "Medio" | "Alto";

type Lead = {
  id: string;
  empresa: string;
  contacto: string;
  email: string;
  telefono: string;
  monto: string;
  etapa: EtapaLead;
  temperatura: TemperaturaLead;
  riesgo: RiesgoLead;
  proximaAccion: string;
  notas: string;
};

type PrioridadAccion = "Alta" | "Media" | "Baja";
type EstadoAccion = "Pendiente" | "En proceso" | "Completada" | "Vencida";
type ImpactoAccion = "Alto" | "Medio" | "Bajo";

type AccionEjecutiva = {
  id: string;
  titulo: string;
  responsable: string;
  prioridad: PrioridadAccion;
  estado: EstadoAccion;
  fechaCompromiso: string;
  leadRelacionado: string;
  impacto: ImpactoAccion;
  recomendacionBNS: string;
  notas: string;
};



type AreaEjecutiva = "Dirección" | "Comercial" | "Operaciones" | "Finanzas" | "Marketing" | "Soporte" | "Tecnología" | "Legal";
type EstadoEjecutivo = "Ganando" | "Estable" | "En presión" | "En riesgo";

type EjecutivoBNS = {
  id: string;
  nombre: string;
  lider: string;
  area: AreaEjecutiva;
  cargo: string;
  pipeline: string;
  revenue: string;
  conversion: string;
  velocidad: string;
  riesgo: RiesgoLead;
  estado: EstadoEjecutivo;
  dependencia: string;
};

type FilaImportada = {
  cliente: string;
  contacto: string;
  email: string;
  telefono: string;
  monto: string;
  etapa: EtapaLead;
  temperatura: TemperaturaLead;
  riesgo: RiesgoLead;
  responsable: string;
  proximaAccion: string;
  notas: string;
};


type Detalle = {
  titulo: string;
  valor: string;
  descripcion: string;
  fuente: string;
  accion: string;
};

type DocumentoLegal = {
  titulo: string;
  descripcion: string;
  contenido: string[];
};

export default function Home() {
  const STORAGE_KEY = "bns_enterprise_state_v1";

  const [hidratado, setHidratado] = useState(false);
  const [supabaseConectado, setSupabaseConectado] = useState(false);
  const [authConectado, setAuthConectado] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [sincronizandoSupabase, setSincronizandoSupabase] = useState(false);
  const [procesandoAuth, setProcesandoAuth] = useState(false);
  const [mensajeSupabase, setMensajeSupabase] = useState("Validando conexión con Supabase...");
  const [mensajeAuth, setMensajeAuth] = useState("Validando sesión de usuario...");
  const [toastBNS, setToastBNS] = useState<{
    tipo: "ok" | "error" | "info";
    titulo: string;
    mensaje: string;
  } | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [tiempoRealActivo, setTiempoRealActivo] = useState(false);
  const [ultimoPulsoTiempoReal, setUltimoPulsoTiempoReal] = useState("Sin eventos aún");
  const [groqGenerando, setGroqGenerando] = useState(false);
  const [groqRespuesta, setGroqRespuesta] = useState("");
  const [groqUltimaLectura, setGroqUltimaLectura] = useState("IA ejecutiva lista para analizar datos reales.");
  const [empresaSupabaseId, setEmpresaSupabaseId] = useState<string | null>(null);
  const [empresasDisponibles, setEmpresasDisponibles] = useState<EmpresaWorkspace[]>([]);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);
  const [sesionActiva, setSesionActiva] = useState(false);
  const [modoAuth, setModoAuth] = useState<"login" | "registro" | "solicitar" | "recuperar">("registro");

  const [usuario, setUsuario] = useState<Usuario>({
    nombre: "",
    email: "",
    telefono: "",
    cargo: "",
    departamento: "Dirección General",
    rol: "Owner",
  });

  const [password, setPassword] = useState("");
  const [nuevaPasswordReset, setNuevaPasswordReset] = useState("");
  const [confirmarPasswordReset, setConfirmarPasswordReset] = useState("");
  const [modoResetPassword, setModoResetPassword] = useState(false);
  const [empresaSolicitada, setEmpresaSolicitada] = useState("");
  const [motivoAcceso, setMotivoAcceso] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [aceptaAutorizacion, setAceptaAutorizacion] = useState(false);
  const [aceptaTratamiento, setAceptaTratamiento] = useState(false);

  const [url, setUrl] = useState("");
  const [analizado, setAnalizado] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [mensajeAnalisis, setMensajeAnalisis] = useState("");
  const [tabActiva, setTabActiva] = useState<Tab>("entrada");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [intelligenceView, setIntelligenceView] = useState<
    "diagnosis" | "risks" | "strategy" | "memory" | "prediction" | "actions" | "scenarios"
  >("diagnosis");
  const [nivelVista, setNivelVista] = useState<"CEO" | "Director" | "Gerente" | "Ejecutivo">("CEO");
  const [nodoOrganizacionalActivo, setNodoOrganizacionalActivo] = useState("CEO / Dirección General");
  const [detalleActivo, setDetalleActivo] = useState<Detalle | null>(null);
  const [documentoActivo, setDocumentoActivo] = useState<DocumentoLegal | null>(null);

  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: "",
    giro: "",
    sitio: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    tamano: "",
    objetivo: "",
    responsable: "",
  });

  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [nuevoMiembro, setNuevoMiembro] = useState<Miembro>({
    nombre: "",
    email: "",
    rol: "Viewer",
    estado: "Pendiente de aprobación",
  });

  const leadVacio: Lead = {
    id: "",
    empresa: "",
    contacto: "",
    email: "",
    telefono: "",
    monto: "",
    etapa: "Nuevo",
    temperatura: "Tibio",
    riesgo: "Medio",
    proximaAccion: "",
    notas: "",
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [nuevoLead, setNuevoLead] = useState<Lead>(leadVacio);

  const accionVacia: AccionEjecutiva = {
    id: "",
    titulo: "",
    responsable: usuario.nombre || "Dirección General",
    prioridad: "Media",
    estado: "Pendiente",
    fechaCompromiso: "",
    leadRelacionado: "",
    impacto: "Medio",
    recomendacionBNS: "",
    notas: "",
  };

  const [accionesEjecutivas, setAccionesEjecutivas] = useState<AccionEjecutiva[]>([]);
  const [nuevaAccion, setNuevaAccion] = useState<AccionEjecutiva>(accionVacia);

  const ejecutivoVacio: EjecutivoBNS = {
    id: "",
    nombre: "",
    lider: usuario.nombre || empresa.responsable || "Dirección General",
    area: "Comercial",
    cargo: "",
    pipeline: "0",
    revenue: "0",
    conversion: "0",
    velocidad: "Media",
    riesgo: "Medio",
    estado: "Estable",
    dependencia: "Media",
  };

  const [ejecutivos, setEjecutivos] = useState<EjecutivoBNS[]>([]);
  const [nuevoEjecutivo, setNuevoEjecutivo] = useState<EjecutivoBNS>(ejecutivoVacio);


  const [archivoImportado, setArchivoImportado] = useState("");
  const [filasImportadas, setFilasImportadas] = useState<FilaImportada[]>([]);
  const [mensajeImportacion, setMensajeImportacion] = useState("");

  const empresaRegistrada = empresa.nombre.trim() !== "";

  const nombreEmpresa = empresaRegistrada
    ? empresa.nombre
    : "Empresa sin registrar";

  const fechaActual = new Date().toLocaleString("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const limiteUsuariosPorPlan = {
    Demo: 1,
    Starter: 3,
    Business: 10,
    Enterprise: 999,
  };

  const planActual: keyof typeof limiteUsuariosPorPlan = "Starter";
  const limiteUsuarios = limiteUsuariosPorPlan[planActual];
  const usuariosUsados = Math.max(1, miembros.length + 1);

  const csvEcosystemStats = useMemo(() => {
    const montoFila = (value: string) => {
      const parsed = Number(String(value || "0").replace(/[^0-9.]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const base = filasImportadas.length > 0 ? filasImportadas : leads.map((lead) => ({
      cliente: lead.empresa,
      contacto: lead.contacto,
      email: lead.email,
      telefono: lead.telefono,
      monto: lead.monto,
      etapa: lead.etapa,
      temperatura: lead.temperatura,
      riesgo: lead.riesgo,
      responsable: "Sin asignar",
      proximaAccion: lead.proximaAccion,
      notas: lead.notas,
    }));

    const total = base.length;
    const pipeline = base.reduce((sum, fila) => sum + montoFila(fila.monto), 0);
    const calientes = base.filter((fila) => fila.temperatura === "Caliente").length;
    const altoRiesgo = base.filter((fila) => fila.riesgo === "Alto").length;
    const ganados = base.filter((fila) => fila.etapa === "Ganado").length;
    const activos = base.filter((fila) => fila.etapa !== "Ganado" && fila.etapa !== "Perdido").length;
    const responsables = Array.from(new Set(base.map((fila) => fila.responsable || "Sin asignar"))).filter(Boolean);
    const conversion = total > 0 ? Math.round((ganados / total) * 100) : 0;

    return {
      total,
      pipeline,
      calientes,
      altoRiesgo,
      ganados,
      activos,
      responsables,
      conversion,
      estado:
        total === 0
          ? "Sin datos"
          : altoRiesgo > total * 0.25
          ? "Riesgo alto"
          : calientes > total * 0.25
          ? "Oportunidad activa"
          : "Datos listos",
    };
  }, [filasImportadas, leads]);


  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHidratado(true);
        return;
      }

      const data = JSON.parse(raw) as Partial<{
        sesionActiva: boolean;
        usuario: Usuario;
        empresa: Empresa;
        miembros: Miembro[];
        leads: Lead[];
        accionesEjecutivas: AccionEjecutiva[];
        ejecutivos: EjecutivoBNS[];
        auditTrail: AuditEvent[];
        liveEvents: LiveEvent[];
        filasImportadas: FilaImportada[];
        archivoImportado: string;
        url: string;
        analizado: boolean;
        tabActiva: Tab;
        sidebarCollapsed: boolean;
        intelligenceView: "diagnosis" | "risks" | "strategy" | "memory" | "prediction" | "actions" | "scenarios";
        nivelVista: "CEO" | "Director" | "Gerente" | "Ejecutivo";
        nodoOrganizacionalActivo: string;
        empresaSupabaseId: string | null;
        empresasDisponibles: EmpresaWorkspace[];
        authUserId: string | null;
      }>;

      if (typeof data.sesionActiva === "boolean") setSesionActiva(data.sesionActiva);
      if (data.usuario) setUsuario((actual) => ({ ...actual, ...data.usuario }));
      if (data.empresa) setEmpresa((actual) => ({ ...actual, ...data.empresa }));
      if (Array.isArray(data.miembros)) setMiembros(data.miembros);
      if (Array.isArray(data.leads)) setLeads(data.leads);
      if (Array.isArray(data.accionesEjecutivas)) setAccionesEjecutivas(data.accionesEjecutivas);
      if (Array.isArray(data.ejecutivos)) setEjecutivos(data.ejecutivos);
      if (Array.isArray(data.filasImportadas)) setFilasImportadas(data.filasImportadas);
      if (typeof data.archivoImportado === "string") setArchivoImportado(data.archivoImportado);
      if (typeof data.url === "string") setUrl(data.url);
      if (typeof data.analizado === "boolean") setAnalizado(data.analizado);
      if (data.tabActiva) setTabActiva(data.tabActiva);
      if (typeof data.sidebarCollapsed === "boolean") setSidebarCollapsed(data.sidebarCollapsed);
      if (data.intelligenceView) setIntelligenceView(data.intelligenceView);
      if (data.nivelVista) setNivelVista(data.nivelVista);
      if (typeof data.nodoOrganizacionalActivo === "string") setNodoOrganizacionalActivo(data.nodoOrganizacionalActivo);
      if (typeof data.empresaSupabaseId === "string") setEmpresaSupabaseId(data.empresaSupabaseId);
      if (data.empresasDisponibles) setEmpresasDisponibles(data.empresasDisponibles);
      if (typeof data.authUserId === "string") setAuthUserId(data.authUserId);
    } catch (error) {
      console.warn("No se pudo cargar el estado local de BNS™", error);
    } finally {
      setHidratado(true);
    }
  }, []);

  useEffect(() => {
    verificarConexionSupabase();

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const vieneDeRecuperacion =
        url.searchParams.get("reset") === "true" ||
        url.hash.includes("type=recovery");

      if (vieneDeRecuperacion) {
        setModoResetPassword(true);
        setModoAuth("recuperar");
        setMensajeAuth("Escribe tu nueva contraseña para finalizar la recuperación.");
      }
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setMensajeAuth(`Auth con error: ${error.message}`);
        setAuthConectado(false);
        return;
      }

      const session = data.session;

      if (session?.user) {
        setSesionActiva(true);
        setAuthConectado(true);
        setAuthUserId(session.user.id);
        setMensajeAuth("Sesión real activa con Supabase Auth.");

        setUsuario((actual) => ({
          ...actual,
          email: session.user.email || actual.email,
          nombre:
            (session.user.user_metadata?.nombre as string) ||
            actual.nombre ||
            session.user.email ||
            "",
        }));
      } else {
        setAuthConectado(false);
        setMensajeAuth("Sin sesión activa. Inicia sesión o crea cuenta.");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSesionActiva(true);
        setAuthConectado(true);
        setAuthUserId(session.user.id);
        setMensajeAuth("Sesión real activa con Supabase Auth.");

        setUsuario((actual) => ({
          ...actual,
          email: session.user.email || actual.email,
          nombre:
            (session.user.user_metadata?.nombre as string) ||
            actual.nombre ||
            session.user.email ||
            "",
        }));
      } else {
        setSesionActiva(false);
        setAuthConectado(false);
        setAuthUserId(null);
        setMensajeAuth("Sin sesión activa. Inicia sesión o crea cuenta.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (empresaSupabaseId) {
      cargarDatosSupabase(empresaSupabaseId);
    }
  }, [empresaSupabaseId]);

  useEffect(() => {
    if (!sesionActiva || !supabaseConectado || !authUserId) return;
    cargarEmpresasDisponibles();
  }, [sesionActiva, supabaseConectado, authUserId]);

  useEffect(() => {
    if (!empresaSupabaseId) {
      setTiempoRealActivo(false);
      setUltimoPulsoTiempoReal("Esperando empresa activa");
      return;
    }

    const channel = supabase
      .channel(`bns-realtime-${empresaSupabaseId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
          filter: `empresa_id=eq.${empresaSupabaseId}`,
        },
        () => {
          setTiempoRealActivo(true);
          setUltimoPulsoTiempoReal(`Lead actualizado • ${new Date().toLocaleTimeString("es-MX")}`);
          registrarEventoVivo(
            "Realtime",
            "Lead actualizado en Supabase",
            "BNS™ recibió un cambio vivo en la tabla leads del workspace activo.",
            "Media"
          );
          cargarDatosSupabase(empresaSupabaseId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "acciones",
          filter: `empresa_id=eq.${empresaSupabaseId}`,
        },
        () => {
          setTiempoRealActivo(true);
          setUltimoPulsoTiempoReal(`Acción actualizada • ${new Date().toLocaleTimeString("es-MX")}`);
          registrarEventoVivo(
            "Realtime",
            "Intervención actualizada en Supabase",
            "BNS™ recibió un cambio vivo en acciones ejecutivas del workspace activo.",
            "Media"
          );
          cargarDatosSupabase(empresaSupabaseId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ejecutivos",
          filter: `empresa_id=eq.${empresaSupabaseId}`,
        },
        () => {
          setTiempoRealActivo(true);
          setUltimoPulsoTiempoReal(`Ejecutivo actualizado • ${new Date().toLocaleTimeString("es-MX")}`);
          registrarEventoVivo(
            "Realtime",
            "Nodo ejecutivo actualizado",
            "BNS™ recibió un cambio vivo en ejecutivos del workspace activo.",
            "Media"
          );
          cargarDatosSupabase(empresaSupabaseId);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setTiempoRealActivo(true);
          setUltimoPulsoTiempoReal(`Realtime activo • ${new Date().toLocaleTimeString("es-MX")}`);
          registrarEventoVivo(
            "System",
            "Realtime activo",
            "Canal Supabase Realtime conectado al workspace actual.",
            "Baja"
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaSupabaseId]);

  useEffect(() => {
    if (!hidratado) return;

    const data = {
      sesionActiva,
      usuario,
      empresa,
      miembros,
      leads,
      accionesEjecutivas,
      ejecutivos,
      auditTrail,
      liveEvents,
      filasImportadas,
      archivoImportado,
      url,
      analizado,
      tabActiva,
      sidebarCollapsed,
      intelligenceView,
      nivelVista,
      nodoOrganizacionalActivo,
      empresaSupabaseId,
      empresasDisponibles,
      authUserId,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [
    STORAGE_KEY,
    hidratado,
    sesionActiva,
    usuario,
    empresa,
    miembros,
    leads,
    accionesEjecutivas,
    ejecutivos,
    auditTrail,
    liveEvents,
    filasImportadas,
    archivoImportado,
    url,
    analizado,
    tabActiva,
    sidebarCollapsed,
    intelligenceView,
    nivelVista,
    nodoOrganizacionalActivo,
    empresaSupabaseId,
    empresasDisponibles,
    authUserId,
  ]);

  const bnsMetrics = useMemo(() => {
    const canalesDigitales = [
      empresa.sitio,
      empresa.whatsapp,
      empresa.instagram,
      empresa.facebook,
    ].filter((valor) => valor.trim() !== "").length;

    const empresaCompleta = [
      empresa.nombre,
      empresa.giro,
      empresa.sitio,
      empresa.tamano,
      empresa.objetivo,
      empresa.responsable || usuario.nombre,
    ].filter((valor) => valor.trim() !== "").length;

    const pipelineTotal = leads.reduce((total, lead) => {
      const montoLimpio = Number(lead.monto.replace(/[^0-9.]/g, ""));
      return total + (Number.isFinite(montoLimpio) ? montoLimpio : 0);
    }, 0);

    const leadsActivos = leads.filter((lead) => lead.etapa !== "Ganado" && lead.etapa !== "Perdido").length;
    const leadsGanados = leads.filter((lead) => lead.etapa === "Ganado").length;
    const clientesEnRiesgo = leads.filter((lead) => lead.riesgo === "Alto").length;
    const leadsCalientes = leads.filter((lead) => lead.temperatura === "Caliente").length;
    const accionesPendientes = accionesEjecutivas.filter((accion) => accion.estado !== "Completada").length;
    const accionesAltaPrioridad = accionesEjecutivas.filter((accion) => accion.prioridad === "Alta" && accion.estado !== "Completada").length;
    const accionesVencidas = accionesEjecutivas.filter((accion) => accion.estado === "Vencida").length;
    const accionesCompletadas = accionesEjecutivas.filter((accion) => accion.estado === "Completada").length;
    const cumplimientoAcciones = accionesEjecutivas.length > 0 ? Math.round((accionesCompletadas / accionesEjecutivas.length) * 100) : 0;
    const conversion = leads.length > 0 ? Math.round((leadsGanados / leads.length) * 100) : 27;

    const scoreBase = empresa.nombre.trim() === "" ? 68 : 74;
    const bnsScore = Math.min(94, scoreBase + empresaCompleta * 3 + canalesDigitales * 2 + miembros.length + Math.min(6, leadsActivos) + Math.min(5, accionesCompletadas));
    const riesgoScore = Math.max(12, 52 - Math.round(bnsScore / 3) + (canalesDigitales === 0 ? 8 : 0) + accionesVencidas * 4 + accionesAltaPrioridad * 2);

    const operacion = Math.min(92, 70 + empresaCompleta * 2);
    const comercial = Math.min(92, 64 + (empresa.objetivo.trim() ? 8 : 0) + (empresa.whatsapp.trim() ? 6 : 0) + Math.min(10, leadsCalientes * 2));
    const digital = Math.min(92, 56 + canalesDigitales * 8);
    const liderazgo = Math.min(88, 60 + (empresa.responsable.trim() || usuario.nombre.trim() ? 12 : 0) + miembros.length * 2);
    const soporte = Math.min(86, 58 + (empresa.whatsapp.trim() ? 8 : 0) + miembros.length * 2);
    const procesos = Math.min(92, 68 + empresaCompleta * 2 + Math.min(8, accionesCompletadas * 2) - Math.min(8, accionesVencidas * 2));

    const presion = riesgoScore >= 42 ? "Alta" : riesgoScore >= 26 ? "Media" : "Baja";

    return {
      bnsScore,
      riesgoScore,
      presion,
      operacionEstado: bnsScore >= 76 ? "Activa" : "En ajuste",
      pipelineTotal,
      leadsActivos,
      leadsGanados,
      clientesEnRiesgo,
      leadsCalientes,
      conversion,
      accionesPendientes,
      accionesAltaPrioridad,
      accionesVencidas,
      accionesCompletadas,
      cumplimientoAcciones,
      areaScores: [
        { label: "Operación", value: operacion, status: operacion >= 80 ? "Fuerte" : "Estable", colorName: "green" as const },
        { label: "Comercial", value: comercial, status: comercial >= 78 ? "Fuerte" : "Presión", colorName: "yellow" as const },
        { label: "Digital", value: digital, status: digital >= 76 ? "Mejora" : "Pendiente", colorName: "cyan" as const },
        { label: "Liderazgo", value: liderazgo, status: liderazgo >= 76 ? "Estable" : "Dependencia", colorName: "purple" as const },
        { label: "Soporte", value: soporte, status: soporte >= 72 ? "Control" : "Atención", colorName: "red" as const },
        { label: "Procesos", value: procesos, status: procesos >= 78 ? "Estable" : "Ordenar", colorName: "blue" as const },
      ],
      trends: [
        { area: "Operación", value: operacion >= 80 ? "+8%" : "+3%", trend: operacion >= 80 ? "UP" : "STABLE", note: "Continuidad funcional" },
        { area: "Comercial", value: comercial >= 78 ? "+6%" : "-5%", trend: comercial >= 78 ? "UP" : "PRESSURE", note: comercial >= 78 ? "Mejor seguimiento" : "Seguimiento irregular" },
        { area: "Digital", value: digital >= 76 ? "+12%" : "+4%", trend: digital >= 76 ? "UP" : "STABLE", note: "Potencial de conversión" },
        { area: "Soporte", value: soporte >= 72 ? "+2%" : "-9%", trend: soporte >= 72 ? "STABLE" : "PRESSURE", note: "Tiempos de respuesta" },
        { area: "Liderazgo", value: liderazgo >= 76 ? "+5%" : "0%", trend: liderazgo >= 76 ? "UP" : "STABLE", note: "Decisión ejecutiva" },
      ],
    };
  }, [empresa, miembros.length, usuario.nombre, leads, accionesEjecutivas]);

  const bnsIntelligence = useMemo(() => {
    const leadsFríos = leads.filter((lead) => lead.temperatura === "Frío").length;
    const leadsRiesgoAlto = leads.filter((lead) => lead.riesgo === "Alto").length;
    const leadsSinProximaAccion = leads.filter((lead) => lead.proximaAccion.trim() === "").length;
    const accionesCriticas = accionesEjecutivas.filter(
      (accion) => accion.prioridad === "Alta" && accion.estado !== "Completada"
    ).length;
    const accionesVencidas = accionesEjecutivas.filter((accion) => accion.estado === "Vencida").length;
    const pipelineSinSeguimiento = leads.filter(
      (lead) => lead.etapa !== "Ganado" && lead.etapa !== "Perdido" && lead.proximaAccion.trim() === ""
    ).length;

    const alertas = [
      ...(leadsRiesgoAlto > 0
        ? [
            {
              nivel: "Crítica",
              area: "Comercial",
              titulo: `${leadsRiesgoAlto} lead${leadsRiesgoAlto === 1 ? "" : "s"} con riesgo alto`,
              descripcion:
                "Oportunidades con riesgo de enfriamiento o pérdida. Dirección debe priorizar contacto, dueño y siguiente paso.",
              accion: "Crear acción ejecutiva de recuperación comercial.",
              color: "text-red-300",
              fondo: "border-red-500/20 bg-red-500/10",
            },
          ]
        : []),
      ...(accionesVencidas > 0
        ? [
            {
              nivel: "Alta",
              area: "Ejecución",
              titulo: `${accionesVencidas} acción${accionesVencidas === 1 ? "" : "es"} vencida${accionesVencidas === 1 ? "" : "s"}`,
              descripcion:
                "Las acciones vencidas elevan presión operativa y reducen control ejecutivo sobre el sistema.",
              accion: "Reasignar responsable o cerrar bloqueo operativo hoy.",
              color: "text-yellow-300",
              fondo: "border-yellow-500/20 bg-yellow-500/10",
            },
          ]
        : []),
      ...(pipelineSinSeguimiento > 0
        ? [
            {
              nivel: "Media",
              area: "Pipeline",
              titulo: `${pipelineSinSeguimiento} oportunidad${pipelineSinSeguimiento === 1 ? "" : "es"} sin próxima acción`,
              descripcion:
                "Un pipeline sin próxima acción pierde trazabilidad. Convierte cada oportunidad crítica en una acción con responsable y fecha.",
              accion: "Asignar próxima acción, fecha y responsable.",
              color: "text-cyan-300",
              fondo: "border-cyan-500/20 bg-cyan-500/10",
            },
          ]
        : []),
      ...(leadsFríos > 0
        ? [
            {
              nivel: "Media",
              area: "Conversión",
              titulo: `${leadsFríos} lead${leadsFríos === 1 ? "" : "s"} frío${leadsFríos === 1 ? "" : "s"}`,
              descripcion:
                "La temperatura comercial indica baja intención o falta de seguimiento reciente.",
              accion: "Enviar reactivación, validar interés y limpiar pipeline.",
              color: "text-purple-300",
              fondo: "border-purple-500/20 bg-purple-500/10",
            },
          ]
        : []),
    ];

    const estadoGeneral =
      bnsMetrics.riesgoScore >= 45 || accionesVencidas > 0
        ? "Presión ejecutiva alta"
        : bnsMetrics.riesgoScore >= 28 || accionesCriticas > 0
        ? "Presión moderada controlable"
        : "Sistema estable en crecimiento";

    const resumenEjecutivo =
      leads.length === 0 && accionesEjecutivas.length === 0
        ? "BNS™ todavía no detecta suficiente actividad operativa. Registra leads, acciones o importa un CSV para activar diagnóstico dinámico."
        : `BNS™ interpreta ${leads.length} lead${leads.length === 1 ? "" : "s"}, ${accionesEjecutivas.length} acción${accionesEjecutivas.length === 1 ? "" : "es"} ejecutiva${accionesEjecutivas.length === 1 ? "" : "s"} y un BNS Index de ${safeNumber(bnsMetrics.bnsScore)}/100. El sistema se encuentra en estado: ${estadoGeneral}.`;

    const recomendaciones = [
      accionesCriticas > 0
        ? "Cerrar primero acciones de prioridad alta antes de abrir nuevas iniciativas."
        : "Mantener cadencia semanal de revisión ejecutiva.",
      leadsRiesgoAlto > 0
        ? "Atender leads en riesgo alto en menos de 24 horas."
        : "Sostener seguimiento preventivo sobre oportunidades activas.",
      bnsMetrics.conversion < 30
        ? "Mejorar conversión documentando objeciones, fuente de lead y siguiente paso."
        : "Usar la conversión actual como base para forecast comercial.",
      bnsMetrics.accionesPendientes > 5
        ? "Reducir acumulación de acciones pendientes con responsables claros."
        : "Mantener pocas acciones, pero con alto impacto y fecha compromiso.",
    ];

    const semaforo =
      bnsMetrics.riesgoScore >= 45 || accionesVencidas > 0
        ? { label: "Rojo", color: "text-red-300", bg: "bg-red-500/10 border-red-500/20" }
        : bnsMetrics.riesgoScore >= 28 || accionesCriticas > 0
        ? { label: "Amarillo", color: "text-yellow-300", bg: "bg-yellow-500/10 border-yellow-500/20" }
        : { label: "Verde", color: "text-green-300", bg: "bg-green-500/10 border-green-500/20" };

    return {
      estadoGeneral,
      resumenEjecutivo,
      alertas: alertas.length > 0 ? alertas : [
        {
          nivel: "Normal",
          area: "Sistema",
          titulo: "Sin alertas críticas activas",
          descripcion: "No hay presión crítica visible con los datos actuales. Mantén leads, acciones y responsables actualizados.",
          accion: "Revisar pipeline y acciones al cierre del día.",
          color: "text-green-300",
          fondo: "border-green-500/20 bg-green-500/10",
        },
      ],
      recomendaciones,
      semaforo,
      señales: [
        { label: "Leads fríos", value: leadsFríos },
        { label: "Riesgo alto", value: leadsRiesgoAlto },
        { label: "Sin próxima acción", value: leadsSinProximaAccion },
        { label: "Acciones críticas", value: accionesCriticas },
      ],
    };
  }, [leads, accionesEjecutivas, bnsMetrics]);




  const executiveIntelligence = useMemo(() => {
    const money = (value: string) => {
      const parsed = Number(value.replace(/[^0-9.]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const scoreEjecutivo = (ejecutivo: EjecutivoBNS) => {
      const conversion = Math.min(100, Math.max(0, Number(ejecutivo.conversion.replace(/[^0-9.]/g, "")) || 0));
      const pipeline = money(ejecutivo.pipeline);
      const revenue = money(ejecutivo.revenue);
      const velocidadScore = ejecutivo.velocidad.toLowerCase().includes("alta") ? 18 : ejecutivo.velocidad.toLowerCase().includes("baja") ? 5 : 12;
      const riesgoPenalty = ejecutivo.riesgo === "Alto" ? 18 : ejecutivo.riesgo === "Medio" ? 8 : 0;
      const estadoBonus = ejecutivo.estado === "Ganando" ? 12 : ejecutivo.estado === "Estable" ? 6 : ejecutivo.estado === "En presión" ? -4 : -10;
      const productividad = pipeline > 0 ? Math.min(20, Math.round((revenue / Math.max(1, pipeline)) * 20)) : 8;
      return Math.max(35, Math.min(98, 45 + Math.round(conversion * 0.22) + productividad + velocidadScore + estadoBonus - riesgoPenalty));
    };

    const ejecutivosConScore = ejecutivos.map((ejecutivo) => ({
      ...ejecutivo,
      score: scoreEjecutivo(ejecutivo),
      pipelineNumber: money(ejecutivo.pipeline),
      revenueNumber: money(ejecutivo.revenue),
    }));

    const topPerformers = [...ejecutivosConScore].sort((a, b) => b.score - a.score).slice(0, 3);
    const ejecutivosEnRiesgo = ejecutivosConScore.filter((ejecutivo) => ejecutivo.score < 68 || ejecutivo.riesgo === "Alto" || ejecutivo.estado === "En riesgo");
    const lideres = Array.from(new Set(ejecutivosConScore.map((ejecutivo) => ejecutivo.lider || "Sin líder")));
    const lecturaPorLider = lideres.map((lider) => {
      const equipo = ejecutivosConScore.filter((ejecutivo) => (ejecutivo.lider || "Sin líder") === lider);
      const scorePromedio = equipo.length > 0 ? Math.round(equipo.reduce((total, ejecutivo) => total + ejecutivo.score, 0) / equipo.length) : 0;
      const pipeline = equipo.reduce((total, ejecutivo) => total + ejecutivo.pipelineNumber, 0);
      const revenue = equipo.reduce((total, ejecutivo) => total + ejecutivo.revenueNumber, 0);
      const riesgo = equipo.filter((ejecutivo) => ejecutivo.riesgo === "Alto" || ejecutivo.score < 68).length;
      return { lider, equipo: equipo.length, scorePromedio, pipeline, revenue, riesgo };
    }).sort((a, b) => b.scorePromedio - a.scorePromedio);

    const dependenciaAlta = ejecutivosConScore.filter((ejecutivo) => ejecutivo.dependencia.toLowerCase().includes("alta")).length;
    const scorePromedio = ejecutivosConScore.length > 0 ? Math.round(ejecutivosConScore.reduce((total, ejecutivo) => total + ejecutivo.score, 0) / ejecutivosConScore.length) : 0;
    const estadoOrganizacional = ejecutivosConScore.length === 0
      ? "Sin capa ejecutiva configurada"
      : scorePromedio >= 82 && ejecutivosEnRiesgo.length === 0
      ? "Liderazgo sano y escalable"
      : scorePromedio >= 70
      ? "Liderazgo estable con presión focalizada"
      : "Presión ejecutiva relevante";

    const señales = [
      ejecutivosConScore.length === 0
        ? "Registra ejecutivos para activar lectura por líder, área y accountability."
        : `BNS™ analiza ${ejecutivosConScore.length} ejecutivo${ejecutivosConScore.length === 1 ? "" : "s"} con score promedio de ${scorePromedio}/100.`,
      ejecutivosEnRiesgo.length > 0
        ? `${ejecutivosEnRiesgo.length} ejecutivo${ejecutivosEnRiesgo.length === 1 ? "" : "s"} requieren revisión por bajo score, riesgo alto o presión.`
        : "No se detectan ejecutivos en riesgo crítico con la información actual.",
      dependenciaAlta > 0
        ? `${dependenciaAlta} persona${dependenciaAlta === 1 ? "" : "s"} concentran dependencia alta; esto puede frenar escalabilidad.`
        : "La dependencia declarada no muestra concentración crítica.",
    ];

    return { ejecutivosConScore, topPerformers, ejecutivosEnRiesgo, lecturaPorLider, scorePromedio, estadoOrganizacional, señales };
  }, [ejecutivos]);

  const forecastIntelligence = useMemo(() => {
    const montoLead = (value: string) => {
      const parsed = Number(String(value || "0").replace(/[^0-9.]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const probabilidadPorEtapa: Record<EtapaLead, number> = {
      Nuevo: 0.12,
      Contactado: 0.25,
      Propuesta: 0.45,
      Negociación: 0.68,
      Ganado: 1,
      Perdido: 0,
    };

    const pipelineTotal = leads
      .filter((lead) => lead.etapa !== "Perdido")
      .reduce((total, lead) => total + montoLead(lead.monto), 0);

    const forecastPonderado = leads.reduce(
      (total, lead) => total + montoLead(lead.monto) * probabilidadPorEtapa[lead.etapa],
      0
    );

    const metaEstimacion = Math.max(1, Math.round(pipelineTotal * 0.72 || 4500000));
    const conservador = Math.round(forecastPonderado * 0.78);
    const probable = Math.round(forecastPonderado);
    const agresivo = Math.round(forecastPonderado * 1.28);
    const desviacionVsMeta = Math.round(((probable - metaEstimacion) / metaEstimacion) * 100);

    const leadsCalientes = leads.filter((lead) => lead.temperatura === "Caliente").length;
    const leadsFrios = leads.filter((lead) => lead.temperatura === "Frío").length;
    const leadsEnNegociacion = leads.filter((lead) => lead.etapa === "Negociación").length;
    const accionesCriticas = accionesEjecutivas.filter((accion) => accion.prioridad === "Alta" && accion.estado !== "Completada").length;

    let confianza = 60;
    confianza += leadsCalientes * 4;
    confianza += leadsEnNegociacion * 6;
    confianza -= leadsFrios * 5;
    confianza -= accionesCriticas * 4;
    confianza -= bnsMetrics.accionesVencidas * 6;
    confianza += Math.min(10, bnsMetrics.cumplimientoAcciones / 8);
    confianza = Math.max(18, Math.min(94, Math.round(confianza)));

    const riesgoCumplimiento = confianza < 45 || desviacionVsMeta < -30 ? "Alto" : confianza < 68 || desviacionVsMeta < -10 ? "Medio" : "Bajo";

    const escenarios = [
      { nombre: "Conservador", valor: conservador, descripcion: "Cierre con presión, baja velocidad o pérdida parcial de oportunidades." },
      { nombre: "Probable", valor: probable, descripcion: "Pipeline ponderado por etapa comercial actual." },
      { nombre: "Agresivo", valor: agresivo, descripcion: "Escenario con velocidad alta, seguimiento fuerte y cierres acelerados." },
    ];

    const lectura = riesgoCumplimiento === "Alto"
      ? "BNS™ detecta riesgo relevante de incumplimiento. Dirección debe priorizar oportunidades en negociación, cerrar acciones críticas y revisar responsables con baja velocidad."
      : riesgoCumplimiento === "Medio"
      ? "BNS™ estima un forecast recuperable, pero sensible a seguimiento comercial, presión ejecutiva y cierre oportuno de acciones prioritarias."
      : "BNS™ estima un forecast saludable. La prioridad es proteger velocidad de respuesta y evitar concentración de decisiones en pocos líderes.";

    return { pipelineTotal, forecastPonderado, metaEstimacion, conservador, probable, agresivo, desviacionVsMeta, confianza, riesgoCumplimiento, escenarios, lectura };
  }, [leads, accionesEjecutivas, bnsMetrics]);

  const predictiveEngine = useMemo(() => {
    const señales: Array<{
      titulo: string;
      descripcion: string;
      nivel: "Alto" | "Medio" | "Bajo";
      accion: string;
    }> = [];

    const leadsFrios = leads.filter((lead) => lead.temperatura === "Frío").length;
    const leadsRiesgoAlto = leads.filter((lead) => lead.riesgo === "Alto").length;
    const accionesCriticasPendientes = accionesEjecutivas.filter(
      (accion) => accion.prioridad === "Alta" && accion.estado !== "Completada"
    ).length;

    const ejecutivosEnRiesgo = executiveIntelligence.ejecutivosConScore.filter(
      (ejecutivo) => ejecutivo.score < 65 || ejecutivo.estado === "En riesgo"
    );

    if (forecastIntelligence.riesgoCumplimiento === "Alto") {
      señales.push({
        titulo: "Riesgo de forecast",
        descripcion:
          "El forecast probable está bajo presión. BNS™ anticipa posible incumplimiento si no se aceleran cierres o seguimiento.",
        nivel: "Alto",
        accion: "Priorizar leads en Negociación y cerrar acciones de alta prioridad.",
      });
    }

    if (leadsFrios + leadsRiesgoAlto >= 3) {
      señales.push({
        titulo: "Enfriamiento comercial",
        descripcion:
          "BNS™ detecta acumulación de leads fríos o de alto riesgo que pueden impactar conversión y revenue.",
        nivel: "Medio",
        accion: "Activar campaña de recuperación y reasignar responsables.",
      });
    }

    if (accionesCriticasPendientes >= 2) {
      señales.push({
        titulo: "Ejecución crítica pendiente",
        descripcion:
          "Hay acciones de alta prioridad abiertas. BNS™ anticipa fricción operativa si no se cierran en el corto plazo.",
        nivel: "Alto",
        accion: "Bloquear agenda directiva para cierre de pendientes críticos.",
      });
    }

    if (ejecutivosEnRiesgo.length > 0) {
      señales.push({
        titulo: "Riesgo ejecutivo",
        descripcion: `${ejecutivosEnRiesgo.length} ejecutivo(s) presentan bajo score o presión operativa.`,
        nivel: "Medio",
        accion: "Revisar carga, pipeline y dependencia por líder.",
      });
    }

    if (señales.length === 0) {
      señales.push({
        titulo: "Sistema estable",
        descripcion:
          "BNS™ no detecta señales predictivas críticas. Mantener seguimiento y monitoreo en tiempo real.",
        nivel: "Bajo",
        accion: "Mantener ritmo operativo y actualización de datos.",
      });
    }

    const riesgoPredictivo =
      señales.some((senal) => senal.nivel === "Alto")
        ? "Alto"
        : señales.some((senal) => senal.nivel === "Medio")
        ? "Medio"
        : "Bajo";

    const confianzaPredictiva = Math.max(
      35,
      Math.min(
        94,
        forecastIntelligence.confianza -
          accionesCriticasPendientes * 4 -
          leadsRiesgoAlto * 3 +
          (tiempoRealActivo ? 8 : 0)
      )
    );

    return {
      señales,
      riesgoPredictivo,
      confianzaPredictiva,
      lectura:
        riesgoPredictivo === "Alto"
          ? "BNS™ anticipa presión relevante. El sistema recomienda intervención ejecutiva inmediata."
          : riesgoPredictivo === "Medio"
          ? "BNS™ detecta señales tempranas. Conviene actuar antes de que escalen a crisis."
          : "BNS™ observa estabilidad operativa con monitoreo predictivo activo.",
    };
  }, [leads, accionesEjecutivas, executiveIntelligence, forecastIntelligence, tiempoRealActivo]);

  const executiveHeatmap = useMemo(() => {
    const items = executiveIntelligence.ejecutivosConScore.map((ejecutivo) => {
      const pipelineNumber = Number(String(ejecutivo.pipeline || "0").replace(/[^0-9.]/g, "")) || 0;
      const revenueNumber = Number(String(ejecutivo.revenue || "0").replace(/[^0-9.]/g, "")) || 0;
      const accionesAbiertas = accionesEjecutivas.filter(
        (accion) => accion.responsable === ejecutivo.nombre && accion.estado !== "Completada"
      ).length;
      const leadsRelacionados = leads.filter(
        (lead) =>
          lead.contacto === ejecutivo.nombre ||
          lead.empresa.toLowerCase().includes(ejecutivo.nombre.toLowerCase()) ||
          lead.notas.toLowerCase().includes(ejecutivo.nombre.toLowerCase())
      ).length;

      let dependenciaScore = 35;
      dependenciaScore += accionesAbiertas * 9;
      dependenciaScore += leadsRelacionados * 6;
      dependenciaScore += ejecutivo.dependencia === "Alta" ? 22 : ejecutivo.dependencia === "Media" ? 12 : 0;
      dependenciaScore = Math.max(12, Math.min(96, dependenciaScore));

      const riesgoScore =
        ejecutivo.riesgo === "Alto"
          ? 88
          : ejecutivo.riesgo === "Medio"
          ? 58
          : Math.max(18, 100 - ejecutivo.score);

      const velocityScore =
        ejecutivo.velocidad.toLowerCase().includes("alta")
          ? 88
          : ejecutivo.velocidad.toLowerCase().includes("baja")
          ? 42
          : 66;

      const estado =
        ejecutivo.score >= 82 && riesgoScore < 55
          ? "Ganando"
          : ejecutivo.score < 62 || riesgoScore > 78
          ? "Riesgo"
          : dependenciaScore > 70
          ? "Dependencia"
          : "Presión";

      const color =
        estado === "Ganando"
          ? "green"
          : estado === "Riesgo"
          ? "red"
          : estado === "Dependencia"
          ? "purple"
          : "yellow";

      const lectura =
        estado === "Ganando"
          ? "Ejecutivo con alto impacto y buena lectura operativa."
          : estado === "Riesgo"
          ? "Requiere intervención directiva por bajo score o alto riesgo."
          : estado === "Dependencia"
          ? "Concentra decisiones, carga o seguimiento; posible cuello de botella."
          : "Mantiene operación, pero con presión que debe monitorearse.";

      return {
        ...ejecutivo,
        pipelineNumber,
        revenueNumber,
        accionesAbiertas,
        leadsRelacionados,
        dependenciaScore,
        riesgoScore,
        velocityScore,
        estado,
        color,
        lectura,
      };
    });

    const topPerformer = [...items].sort((a, b) => b.score - a.score)[0];
    const mayorRiesgo = [...items].sort((a, b) => b.riesgoScore - a.riesgoScore)[0];
    const mayorDependencia = [...items].sort((a, b) => b.dependenciaScore - a.dependenciaScore)[0];

    return {
      items,
      topPerformer,
      mayorRiesgo,
      mayorDependencia,
      resumen:
        items.length === 0
          ? "Aún no hay ejecutivos suficientes para construir heatmap."
          : `BNS™ identifica ${items.length} ejecutivo(s), con ${items.filter((item) => item.estado === "Riesgo").length} en riesgo y ${items.filter((item) => item.estado === "Dependencia").length} con posible dependencia crítica.`,
    };
  }, [executiveIntelligence, accionesEjecutivas, leads]);

  const organizationalDrilldown = useMemo(() => {
    const directores = Array.from(
      new Set(
        ejecutivos
          .map((ejecutivo) => ejecutivo.lider || "Dirección General")
          .filter(Boolean)
      )
    );

    const areas = Array.from(
      new Set(
        ejecutivos
          .map((ejecutivo) => ejecutivo.area || "Comercial")
          .filter(Boolean)
      )
    );

    const ejecutivosPorLider = directores.map((lider) => {
      const equipo = executiveHeatmap.items.filter((ejecutivo) => ejecutivo.lider === lider);
      const scorePromedio =
        equipo.length > 0
          ? Math.round(equipo.reduce((total, ejecutivo) => total + ejecutivo.score, 0) / equipo.length)
          : 0;
      const riesgoPromedio =
        equipo.length > 0
          ? Math.round(equipo.reduce((total, ejecutivo) => total + ejecutivo.riesgoScore, 0) / equipo.length)
          : 0;

      return {
        lider,
        equipo,
        scorePromedio,
        riesgoPromedio,
        estado:
          riesgoPromedio >= 70
            ? "Riesgo"
            : riesgoPromedio >= 48
            ? "Presión"
            : "Estable",
      };
    });

    const niveles = [
      {
        nivel: "CEO" as const,
        titulo: "CEO / Dirección General",
        descripcion: "Puede ver toda la empresa, todas las capas y descender hasta acciones individuales.",
        alcance: "Organización completa",
        visible: true,
        metricas: [
          ["BNS Index", `${safeNumber(bnsMetrics.bnsScore)}/100`],
          ["Revenue Forecast", `${safePercent(forecastIntelligence.confianza)}%`],
          ["Pressure", `${safePercent(bnsMetrics.presion)}%`],
          ["Riesgo", predictiveEngine.riesgoPredictivo],
        ],
      },
      {
        nivel: "Director" as const,
        titulo: "Directores / Heads",
        descripcion: "Ven su dirección, equipos, gerencias, forecast, presión y dependencias bajo su mando.",
        alcance: "Dirección + gerencias + ejecutivos",
        visible: usuario.rol !== "Viewer",
        metricas: [
          ["Direcciones", `${Math.max(1, directores.length)}`],
          ["Score prom.", `${executiveIntelligence.scorePromedio}`],
          ["Riesgo mayor", executiveHeatmap.mayorRiesgo?.nombre || "Sin datos"],
          ["Dependencia", executiveHeatmap.mayorDependencia?.nombre || "Sin datos"],
        ],
      },
      {
        nivel: "Gerente" as const,
        titulo: "Gerentes / Coordinadores",
        descripcion: "Ven su equipo, señales operativas, acciones, clientes y riesgos de ejecución.",
        alcance: "Equipo + señales + intervenciones",
        visible: usuario.rol !== "Viewer",
        metricas: [
          ["Acciones", `${accionesEjecutivas.length}`],
          ["Pendientes", `${bnsMetrics.accionesPendientes}`],
          ["Leads", `${leads.length}`],
          ["Riesgo alto", `${bnsMetrics.clientesEnRiesgo}`],
        ],
      },
      {
        nivel: "Ejecutivo" as const,
        titulo: "Ejecutivos / Analistas",
        descripcion: "Ven únicamente lo asignado: oportunidades, intervenciones, alertas y próximos pasos.",
        alcance: "Trabajo asignado",
        visible: true,
        metricas: [
          ["Mis señales", `${leads.filter((lead) => lead.contacto === usuario.nombre || lead.notas.includes(usuario.nombre)).length}`],
          ["Mis acciones", `${accionesEjecutivas.filter((accion) => accion.responsable === usuario.nombre).length}`],
          ["Prioridad", accionesEjecutivas.some((accion) => accion.responsable === usuario.nombre && accion.prioridad === "Alta") ? "Alta" : "Normal"],
          ["Estado", "Operativo"],
        ],
      },
    ];

    const arbol = {
      nombre: empresa.nombre || "Empresa",
      tipo: "Empresa",
      estado: predictiveEngine.riesgoPredictivo,
      hijos: [
        {
          nombre: "CEO / Dirección General",
          tipo: "Executive",
          estado: bnsMetrics.presion >= 70 ? "Presión" : "Activo",
          hijos: ejecutivosPorLider.map((grupo) => ({
            nombre: grupo.lider,
            tipo: "Director",
            estado: grupo.estado,
            hijos: grupo.equipo.map((ejecutivo) => ({
              nombre: ejecutivo.nombre,
              tipo: "Ejecutivo",
              estado: ejecutivo.estado,
              score: ejecutivo.score,
              riesgo: ejecutivo.riesgoScore,
              dependencia: ejecutivo.dependenciaScore,
            })),
          })),
        },
      ],
    };

    const lectura =
      nivelVista === "CEO"
        ? "Vista completa de la empresa. Puedes descender desde salud organizacional hasta responsables y acciones."
        : nivelVista === "Director"
        ? "Vista táctica por dirección. Prioriza líderes, forecast, equipos y dependencias bajo tu mando."
        : nivelVista === "Gerente"
        ? "Vista operativa. Enfócate en ejecución, seguimiento, señales y desbloqueo de acciones."
        : "Vista de ejecución. BNS™ muestra únicamente prioridades asignadas, clientes y próximos pasos.";

    return {
      niveles,
      arbol,
      ejecutivosPorLider,
      lectura,
      directores,
      areas,
    };
  }, [
    empresa,
    usuario,
    ejecutivos,
    executiveHeatmap,
    executiveIntelligence,
    bnsMetrics,
    forecastIntelligence,
    predictiveEngine,
    accionesEjecutivas,
    leads,
    nivelVista,
  ]);




  const timelineNeural = useMemo(() => {
    const eventos: Array<{
      hora: string;
      tipo: "Revenue Forecast" | "Lead" | "Acción" | "Ejecutivo" | "Realtime" | "Sistema";
      titulo: string;
      descripcion: string;
      severidad: "Alta" | "Media" | "Baja";
    }> = [];

    const ahora = new Date();
    const horaBase = ahora.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

    eventos.push({
      hora: horaBase,
      tipo: "Sistema",
      titulo: "BNS™ Neural Core activo",
      descripcion: `Score ${safeNumber(bnsMetrics.bnsScore)}/100 con presión ${safePercent(bnsMetrics.presion)}% y forecast confidence ${safePercent(forecastIntelligence.confianza)}%.`,
      severidad: bnsMetrics.presion >= 70 ? "Alta" : bnsMetrics.presion >= 48 ? "Media" : "Baja",
    });

    if (tiempoRealActivo) {
      eventos.push({
        hora: horaBase,
        tipo: "Realtime",
        titulo: "Pulso en tiempo real recibido",
        descripcion: ultimoPulsoTiempoReal,
        severidad: "Baja",
      });
    }

    if (forecastIntelligence.riesgoCumplimiento !== "Bajo") {
      eventos.push({
        hora: horaBase,
        tipo: "Revenue Forecast",
        titulo: "Revenue Forecast bajo vigilancia",
        descripcion: `Riesgo ${forecastIntelligence.riesgoCumplimiento}; desviación vs meta ${forecastIntelligence.desviacionVsMeta}%.`,
        severidad: forecastIntelligence.riesgoCumplimiento === "Alto" ? "Alta" : "Media",
      });
    }

    leads
      .filter((lead) => lead.riesgo === "Alto" || lead.temperatura === "Frío")
      .slice(0, 3)
      .forEach((lead) => {
        eventos.push({
          hora: horaBase,
          tipo: "Lead",
          titulo: `${lead.empresa} requiere seguimiento`,
          descripcion: `${lead.etapa} • ${lead.temperatura} • Riesgo ${lead.riesgo}. Acción: ${lead.proximaAccion || "definir siguiente paso"}.`,
          severidad: lead.riesgo === "Alto" ? "Alta" : "Media",
        });
      });

    accionesEjecutivas
      .filter((accion) => accion.prioridad === "Alta" && accion.estado !== "Completada")
      .slice(0, 3)
      .forEach((accion) => {
        eventos.push({
          hora: horaBase,
          tipo: "Acción",
          titulo: accion.titulo,
          descripcion: `${accion.responsable} tiene acción crítica ${accion.estado}. ${accion.recomendacionBNS}`,
          severidad: accion.estado === "Vencida" ? "Alta" : "Media",
        });
      });

    executiveHeatmap.items
      .filter((ejecutivo) => ejecutivo.estado === "Riesgo" || ejecutivo.estado === "Dependencia")
      .slice(0, 3)
      .forEach((ejecutivo) => {
        eventos.push({
          hora: horaBase,
          tipo: "Ejecutivo",
          titulo: `${ejecutivo.nombre} en ${ejecutivo.estado}`,
          descripcion: ejecutivo.lectura,
          severidad: ejecutivo.estado === "Riesgo" ? "Alta" : "Media",
        });
      });

    return eventos.slice(0, 12);
  }, [
    bnsMetrics,
    forecastIntelligence,
    leads,
    accionesEjecutivas,
    executiveHeatmap,
    tiempoRealActivo,
    ultimoPulsoTiempoReal,
  ]);

  const aiCopilot = useMemo(() => {
    const respuestas = [
      {
        pregunta: "¿Qué está frenando crecimiento?",
        respuesta:
          predictiveEngine.riesgoPredictivo === "Alto"
            ? "BNS™ detecta que el crecimiento está siendo frenado por presión predictiva alta: forecast vulnerable, acciones críticas abiertas o concentración ejecutiva."
            : "BNS™ no detecta bloqueo crítico, pero recomienda proteger velocidad comercial y seguimiento ejecutivo.",
      },
      {
        pregunta: "¿Quién requiere atención directiva?",
        respuesta:
          executiveHeatmap.mayorRiesgo
            ? `${executiveHeatmap.mayorRiesgo.nombre} requiere atención. Estado: ${executiveHeatmap.mayorRiesgo.estado}. ${executiveHeatmap.mayorRiesgo.lectura}`
            : "Aún no hay suficientes datos ejecutivos para detectar riesgo individual.",
      },
      {
        pregunta: "¿Qué pasará si no actuamos?",
        respuesta:
          forecastIntelligence.riesgoCumplimiento === "Alto"
            ? "Si no se actúa, BNS™ anticipa mayor probabilidad de incumplimiento de meta y aumento de presión organizacional."
            : "Si no se actúa, el sistema puede mantenerse estable, pero se perderá oportunidad de mejorar velocidad y predictibilidad.",
      },
      {
        pregunta: "¿Dónde existe dependencia crítica?",
        respuesta:
          executiveHeatmap.mayorDependencia
            ? `La mayor dependencia detectada está en ${executiveHeatmap.mayorDependencia.nombre}, con score de dependencia ${executiveHeatmap.mayorDependencia.dependenciaScore}%.`
            : "BNS™ aún no detecta dependencia crítica con los datos actuales.",
      },
    ];

    const recomendacionPrincipal =
      predictiveEngine.riesgoPredictivo === "Alto"
        ? "Intervención ejecutiva inmediata: cerrar acciones críticas, reasignar leads fríos y reducir dependencia de líderes saturados."
        : predictiveEngine.riesgoPredictivo === "Medio"
        ? "Actuar preventivamente: revisar forecast, responsables de seguimiento y cargas ejecutivas."
        : "Mantener cadencia y seguir alimentando datos para fortalecer predicción.";

    return {
      respuestas,
      recomendacionPrincipal,
      estado: predictiveEngine.riesgoPredictivo === "Alto" ? "Intervención" : "Monitoreo",
    };
  }, [predictiveEngine, executiveHeatmap, forecastIntelligence]);

  const strategicAnalysis = useMemo(() => {
    const fortalezas = [
      bnsMetrics.bnsScore >= 80
        ? "Salud empresarial sólida con BNS Index alto."
        : "Base operativa funcional para iniciar medición ejecutiva.",
      forecastIntelligence.confianza >= 65
        ? "Revenue Forecast con confianza razonable para toma de decisiones."
        : "Revenue Forecast ya cuenta con señales iniciales para mejorar predictibilidad.",
      tiempoRealActivo
        ? "Capa realtime activa para alimentar decisiones vivas."
        : "Arquitectura preparada para realtime ingestion vía Supabase.",
    ];

    const oportunidades = [
      "Sourcess pasivas: Excel, formularios, WhatsApp, ERP y CRM.",
      "Convertir acciones ejecutivas en intervenciones medibles.",
      "Usar Heatmap™ para detectar quién impulsa o frena crecimiento.",
    ];

    const debilidades = [
      leads.length === 0
        ? "Pipeline sin señales suficientes; el forecast depende de datos demo."
        : "Pipeline aún requiere disciplina de alimentación para mayor precisión.",
      accionesEjecutivas.filter((accion) => accion.estado !== "Completada").length > 0
        ? "Acciones abiertas pueden generar fricción si no se cierran."
        : "La operación necesita mantener historial para aprender patrones.",
      ejecutivos.length === 0
        ? "Falta mapa ejecutivo para medir dependencia y desempeño."
        : "La dependencia por líder aún debe monitorearse con más historial.",
    ];

    const amenazas = [
      forecastIntelligence.riesgoCumplimiento === "Alto"
        ? "Riesgo alto de incumplimiento de forecast si no se interviene."
        : "Riesgo de baja visibilidad si las fuentes no se conectan en tiempo real.",
      bnsMetrics.presion >= 60
        ? "Presión organizacional creciente; puede convertirse en cuello de botella."
        : "La presión puede aumentar si crece demanda sin automatización.",
      "Dependencia de captura manual si no se conectan fuentes pasivas.",
    ];

    const pestel = [
      { factor: "Político / Legal", lectura: "Gobernanza, privacidad, permisos y trazabilidad serán críticos para adopción enterprise." },
      { factor: "Económico", lectura: "Revenue Forecast, revenue y presión operativa deben conectarse a datos financieros reales." },
      { factor: "Social", lectura: "La adopción dependerá de reducir carga manual y mostrar valor directo a líderes." },
      { factor: "Tecnológico", lectura: "Supabase, realtime, IA y APIs permitirán convertir señales dispersas en inteligencia." },
      { factor: "Operativo", lectura: "El mayor riesgo es que los equipos no capturen; BNS™ debe absorber señales pasivas." },
      { factor: "Competitivo", lectura: "La diferenciación está en interpretación organizacional, no en ser otro CRM." },
    ];

    const escenarios = [
      {
        nombre: "Conservador",
        lectura: "BNS™ opera como cockpit ejecutivo alimentado por captura manual e importación CSV.",
        impacto: "Visibilidad mejorada, pero predicción limitada.",
      },
      {
        nombre: "Probable",
        lectura: "BNS™ integra Supabase realtime, CSV, leads, acciones y ejecutivos para señales vivas.",
        impacto: "Revenue Forecast, presión y heatmap comienzan a tomar valor directivo real.",
      },
      {
        nombre: "Agresivo",
        lectura: "BNS™ conecta WhatsApp, ERP, formularios, CRM y Executive AI con memoria empresarial.",
        impacto: "Sistema nervioso empresarial predictivo con intervención automática.",
      },
    ];

    return {
      fortalezas,
      oportunidades,
      debilidades,
      amenazas,
      pestel,
      escenarios,
      conclusion:
        "BNS™ debe evolucionar de dashboard a sistema nervioso: capturar señales pasivas, interpretar comportamiento, predecir fricción y recomendar intervenciones ejecutivas.",
    };
  }, [
    bnsMetrics,
    forecastIntelligence,
    tiempoRealActivo,
    leads,
    accionesEjecutivas,
    ejecutivos,
  ]);


  const revenueSegmentation = useMemo(() => {
    const montoLead = (value: string) => {
      const parsed = Number(String(value || "0").replace(/[^0-9.]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const byStage = (["Nuevo", "Contactado", "Propuesta", "Negociación", "Ganado", "Perdido"] as EtapaLead[]).map((stage) => {
      const items = leads.filter((lead) => lead.etapa === stage);
      const value = items.reduce((sum, lead) => sum + montoLead(lead.monto), 0);
      return {
        label: stage,
        count: items.length,
        value,
        percent: leads.length > 0 ? Math.round((items.length / leads.length) * 100) : 0,
      };
    });

    const byRisk = (["Alto", "Medio", "Bajo"] as RiesgoLead[]).map((risk) => {
      const items = leads.filter((lead) => lead.riesgo === risk);
      const value = items.reduce((sum, lead) => sum + montoLead(lead.monto), 0);
      return {
        label: risk,
        count: items.length,
        value,
        percent: leads.length > 0 ? Math.round((items.length / leads.length) * 100) : 0,
      };
    });

    const byTemperature = (["Caliente", "Tibio", "Frío"] as TemperaturaLead[]).map((temperature) => {
      const items = leads.filter((lead) => lead.temperatura === temperature);
      const value = items.reduce((sum, lead) => sum + montoLead(lead.monto), 0);
      return {
        label: temperature,
        count: items.length,
        value,
        percent: leads.length > 0 ? Math.round((items.length / leads.length) * 100) : 0,
      };
    });

    const owners = Array.from(
      new Set(
        leads.map((lead) => {
          const match = lead.notas.match(/Responsable original: ([^•]+)/);
          return match?.[1]?.trim() || "Sin asignar";
        })
      )
    );

    const byOwner = owners
      .map((owner) => {
        const items = leads.filter((lead) => {
          const match = lead.notas.match(/Responsable original: ([^•]+)/);
          const responsable = match?.[1]?.trim() || "Sin asignar";
          return responsable === owner;
        });

        const value = items.reduce((sum, lead) => sum + montoLead(lead.monto), 0);
        const critical = items.filter((lead) => lead.riesgo === "Alto").length;

        return {
          label: owner,
          count: items.length,
          value,
          critical,
          percent: leads.length > 0 ? Math.round((items.length / leads.length) * 100) : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    const totalPipeline = leads.reduce((sum, lead) => sum + montoLead(lead.monto), 0);
    const revenueAtRisk = leads
      .filter((lead) => lead.riesgo === "Alto")
      .reduce((sum, lead) => sum + montoLead(lead.monto), 0);
    const frozenRevenue = leads
      .filter((lead) => lead.temperatura === "Frío" || lead.proximaAccion.trim() === "")
      .reduce((sum, lead) => sum + montoLead(lead.monto), 0);
    const securedRevenue = leads
      .filter((lead) => lead.etapa === "Ganado")
      .reduce((sum, lead) => sum + montoLead(lead.monto), 0);

    const topCriticalLeads = [...leads]
      .filter((lead) => lead.riesgo === "Alto" || lead.temperatura === "Frío")
      .sort((a, b) => montoLead(b.monto) - montoLead(a.monto))
      .slice(0, 8);

    return {
      byStage,
      byRisk,
      byTemperature,
      byOwner,
      totalPipeline,
      revenueAtRisk,
      frozenRevenue,
      securedRevenue,
      topCriticalLeads,
      riskPercent: totalPipeline > 0 ? Math.round((revenueAtRisk / totalPipeline) * 100) : 0,
      lectura:
        revenueAtRisk > 0
          ? `Hay ${formatoMoneda(safeNumber(revenueAtRisk))} en revenue con riesgo alto. Dirección debe priorizar rescate y ownership.`
          : "No se detecta revenue crítico con los datos actuales.",
    };
  }, [leads]);

  function construirNarrativaLead(lead: Lead) {
    const monto = Number(String(lead.monto || "0").replace(/[^0-9.]/g, ""));
    const responsableMatch = lead.notas.match(/Responsable original: ([^•]+)/);
    const responsable = responsableMatch?.[1]?.trim() || "Sin asignar";

    const estado =
      lead.riesgo === "Alto"
        ? "Riesgo de pérdida silenciosa"
        : lead.temperatura === "Caliente"
        ? "Oportunidad prioritaria de cierre"
        : lead.temperatura === "Frío"
        ? "Oportunidad detenida o enfriándose"
        : "Seguimiento requerido";

    const razon =
      lead.riesgo === "Alto"
        ? "presenta riesgo alto y puede afectar el forecast si no se interviene."
        : lead.temperatura === "Frío"
        ? "muestra baja temperatura comercial y requiere reactivación."
        : lead.etapa === "Negociación"
        ? "está en etapa sensible de cierre y debe protegerse."
        : "requiere seguimiento para mantener trazabilidad comercial.";

    const recomendacion =
      lead.riesgo === "Alto"
        ? "Escalar seguimiento ejecutivo antes de 48 horas."
        : lead.temperatura === "Caliente"
        ? "Acelerar propuesta/cierre y bloquear siguiente acción."
        : lead.proximaAccion.trim() === ""
        ? "Definir próxima acción y responsable hoy."
        : `Ejecutar: ${lead.proximaAccion}`;

    return {
      estado,
      resumen: `${lead.empresa} ${razon} Revenue asociado: ${formatoMoneda(Number.isFinite(monto) ? monto : 0)}. Responsable: ${responsable}.`,
      recomendacion,
      responsable,
    };
  }




  const pressureEngine = useMemo(() => {
    const ejecutivosPresion = executiveIntelligence.ejecutivosConScore.map((ejecutivo) => {
      const leadsRelacionados = leads.filter((lead) => lead.contacto === ejecutivo.nombre || lead.empresa.includes(ejecutivo.nombre));
      const accionesRelacionadas = accionesEjecutivas.filter((accion) => accion.responsable === ejecutivo.nombre && accion.estado !== "Completada");
      let score = 35;
      score += accionesRelacionadas.length * 9;
      score += leadsRelacionados.length * 5;
      score += ejecutivo.riesgo === "Alto" ? 20 : ejecutivo.riesgo === "Medio" ? 10 : 0;
      score += ejecutivo.dependencia.toLowerCase().includes("alta") ? 16 : ejecutivo.dependencia.toLowerCase().includes("media") ? 8 : 0;
      score += ejecutivo.score < 68 ? 14 : ejecutivo.score >= 82 ? -8 : 0;
      score = Math.max(10, Math.min(98, Math.round(score)));
      return {
        tipo: "Ejecutivo",
        nombre: ejecutivo.nombre,
        score,
        estado: score >= 75 ? "Saturación" : score >= 52 ? "Presión" : "Estable",
        lectura: score >= 75 ? "Sobrecarga o dependencia crítica con riesgo de cuello de botella." : score >= 52 ? "Presión operativa moderada; requiere seguimiento semanal." : "Carga controlada y operación estable.",
      };
    });

    const lideresPresion = executiveIntelligence.lecturaPorLider.map((lider) => {
      let score = 45;
      score += lider.riesgo * 12;
      score += lider.equipo <= 1 ? 12 : 0;
      score += lider.scorePromedio < 68 ? 18 : lider.scorePromedio >= 82 ? -8 : 0;
      score = Math.max(10, Math.min(96, Math.round(score)));
      return {
        tipo: "Líder",
        nombre: lider.lider,
        score,
        estado: score >= 75 ? "Saturación" : score >= 52 ? "Presión" : "Estable",
        lectura: lider.equipo <= 1 ? "Alta dependencia estructural: pocos ejecutivos sostienen el resultado." : "Presión calculada por equipo, riesgo y score promedio.",
      };
    });

    const areas = Array.from(new Set(executiveIntelligence.ejecutivosConScore.map((ejecutivo) => ejecutivo.area)));
    const areasPresion = areas.map((area) => {
      const ejecutivosArea = executiveIntelligence.ejecutivosConScore.filter((ejecutivo) => ejecutivo.area === area);
      const scorePromedio = ejecutivosArea.length > 0 ? Math.round(ejecutivosArea.reduce((total, ejecutivo) => total + ejecutivo.score, 0) / ejecutivosArea.length) : 70;
      const riesgo = ejecutivosArea.filter((ejecutivo) => ejecutivo.riesgo === "Alto" || ejecutivo.score < 68).length;
      const accionesArea = accionesEjecutivas.filter((accion) => accion.estado !== "Completada" && accion.titulo.toLowerCase().includes(area.toLowerCase())).length;
      let score = 38 + riesgo * 14 + accionesArea * 8 + (scorePromedio < 68 ? 16 : 0);
      score = Math.max(10, Math.min(96, Math.round(score)));
      return {
        tipo: "Área",
        nombre: area,
        score,
        estado: score >= 75 ? "Saturación" : score >= 52 ? "Presión" : "Estable",
        lectura: "Lectura cruzada por score ejecutivo, acciones pendientes y riesgo por área.",
      };
    });

    const items = [...ejecutivosPresion, ...lideresPresion, ...areasPresion].sort((a, b) => b.score - a.score);
    const promedio = items.length > 0 ? Math.round(items.reduce((total, item) => total + item.score, 0) / items.length) : bnsMetrics.riesgoScore;
    const estadoGeneral = promedio >= 75 ? "Saturación organizacional" : promedio >= 52 ? "Presión controlable" : "Sistema estable";
    const señalPrincipal = items[0]
      ? `BNS™ detecta mayor presión en ${items[0].nombre} (${items[0].tipo}) con ${items[0].score}%.`
      : "BNS™ no detecta presión organizacional crítica todavía.";

    return { items, promedio, estadoGeneral, señalPrincipal };
  }, [executiveIntelligence, accionesEjecutivas, leads, bnsMetrics.riesgoScore]);


  const signalEventEngine = useMemo(() => {
    const eventos: Array<{
      id: string;
      tipo: "Revenue" | "Leadership" | "Operations" | "Data" | "AI" | "Governance";
      titulo: string;
      descripcion: string;
      severidad: "Crítica" | "Alta" | "Media" | "Baja";
      accion: string;
      impacto: string;
    }> = [];

    const leadsSinMovimiento = leads.filter(
      (lead) =>
        lead.etapa !== "Ganado" &&
        lead.etapa !== "Perdido" &&
        (lead.riesgo === "Alto" || lead.temperatura === "Frío" || !lead.proximaAccion)
    ).length;

    const leadsCriticos = leads.filter((lead) => lead.riesgo === "Alto").length;
    const accionesCriticas = accionesEjecutivas.filter(
      (accion) => accion.prioridad === "Alta" && accion.estado !== "Completada"
    ).length;

    const mayorDependencia = executiveHeatmap.mayorDependencia;
    const mayorRiesgo = executiveHeatmap.mayorRiesgo;

    if (forecastIntelligence.riesgoCumplimiento === "Alto" || forecastIntelligence.confianza < 50) {
      eventos.push({
        id: "forecast-integrity",
        tipo: "Revenue",
        titulo: "Revenue Forecast integrity weakening",
        descripcion: `La confianza del forecast está en ${safePercent(forecastIntelligence.confianza)}% con desviación vs meta de ${forecastIntelligence.desviacionVsMeta}%.`,
        severidad: "Crítica",
        accion: "Revisar oportunidades en negociación y bloquear seguimiento ejecutivo inmediato.",
        impacto: "Riesgo directo sobre revenue y predictibilidad.",
      });
    }

    if (leadsSinMovimiento >= 10) {
      eventos.push({
        id: "stalled-opportunities",
        tipo: "Revenue",
        titulo: `${leadsSinMovimiento} opportunity signals sin tracción`,
        descripcion: "BNS™ detecta oportunidades sin avance, riesgo alto o sin próxima acción clara.",
        severidad: leadsSinMovimiento >= 25 ? "Crítica" : "Alta",
        accion: "Activar intervención comercial y reasignar responsables.",
        impacto: "Puede provocar desaceleración comercial y pérdida de conversión.",
      });
    }

    if (leadsCriticos >= 5) {
      eventos.push({
        id: "critical-leads",
        tipo: "Revenue",
        titulo: `${leadsCriticos} señales comerciales críticas`,
        descripcion: "Hay concentración de oportunidades con riesgo alto dentro del pipeline.",
        severidad: "Alta",
        accion: "Priorizar rescate de cuentas y revisar causas de riesgo.",
        impacto: "Afecta forecast, conversión y salud del pipeline.",
      });
    }

    if (accionesCriticas >= 2) {
      eventos.push({
        id: "critical-actions",
        tipo: "Operations",
        titulo: "Intervenciones críticas pendientes",
        descripcion: `${accionesCriticas} acciones de alta prioridad siguen abiertas.`,
        severidad: accionesCriticas >= 5 ? "Crítica" : "Alta",
        accion: "Cerrar o escalar intervenciones en comité directivo.",
        impacto: "Aumenta fricción operativa y presión organizacional.",
      });
    }

    if (pressureEngine.promedio >= 70 || bnsMetrics.presion >= 70) {
      eventos.push({
        id: "pressure-rising",
        tipo: "Operations",
        titulo: "Organizational pressure rising",
        descripcion: `La presión promedio está en ${safePercent(pressureEngine.promedio)}% y el sistema detecta sobrecarga.`,
        severidad: "Crítica",
        accion: "Reducir carga, eliminar bloqueos y revisar líderes saturados.",
        impacto: "Puede derivar en cuello de botella operativo.",
      });
    }

    if (mayorDependencia && mayorDependencia.dependenciaScore >= 70) {
      eventos.push({
        id: "dependency-concentration",
        tipo: "Leadership",
        titulo: "Executive dependency concentration",
        descripcion: `${mayorDependencia.nombre} concentra una dependencia estimada de ${mayorDependencia.dependenciaScore}%.`,
        severidad: mayorDependencia.dependenciaScore >= 85 ? "Crítica" : "Alta",
        accion: "Redistribuir aprobaciones, decisiones y ownership operativo.",
        impacto: "Riesgo de cuello de botella humano.",
      });
    }

    if (mayorRiesgo && mayorRiesgo.riesgoScore >= 70) {
      eventos.push({
        id: "leadership-risk",
        tipo: "Leadership",
        titulo: "Leadership risk detected",
        descripcion: `${mayorRiesgo.nombre} presenta riesgo ejecutivo estimado en ${mayorRiesgo.riesgoScore}%.`,
        severidad: "Alta",
        accion: "Revisar carga, desempeño, dependencia y soporte directivo.",
        impacto: "Puede afectar velocidad de decisión y ejecución.",
      });
    }

    if (!tiempoRealActivo) {
      eventos.push({
        id: "realtime-standby",
        tipo: "Data",
        titulo: "Realtime ingestion en espera",
        descripcion: "El sistema está preparado para eventos vivos, pero no detecta pulso activo reciente.",
        severidad: "Media",
        accion: "Validar Supabase realtime, fuentes y sincronización de datos.",
        impacto: "Reduce capacidad de anticipación en tiempo real.",
      });
    }

    if (groqRespuesta) {
      eventos.push({
        id: "ai-reading",
        tipo: "AI",
        titulo: "AI executive brief disponible",
        descripcion: "Groq generó una lectura ejecutiva basada en las señales actuales.",
        severidad: "Baja",
        accion: "Usar la lectura IA para priorizar decisiones del boardroom.",
        impacto: "Mejora calidad de diagnóstico y alineación directiva.",
      });
    }

    if (eventos.length === 0) {
      eventos.push({
        id: "stable-system",
        tipo: "AI",
        titulo: "No critical enterprise signals detected",
        descripcion: "BNS™ no detecta eventos críticos con los datos actuales.",
        severidad: "Baja",
        accion: "Mantener monitoreo y seguir alimentando fuentes.",
        impacto: "Sistema estable con vigilancia activa.",
      });
    }

    const severidadOrden = {
      Crítica: 4,
      Alta: 3,
      Media: 2,
      Baja: 1,
    };

    const ordenados = [...eventos].sort(
      (a, b) => severidadOrden[b.severidad] - severidadOrden[a.severidad]
    );

    const estado =
      ordenados.some((evento) => evento.severidad === "Crítica")
        ? "Critical"
        : ordenados.some((evento) => evento.severidad === "Alta")
        ? "Watch"
        : "Stable";

    return {
      eventos: ordenados,
      estado,
      criticos: ordenados.filter((evento) => evento.severidad === "Crítica").length,
      altos: ordenados.filter((evento) => evento.severidad === "Alta").length,
      lectura:
        estado === "Critical"
          ? "BNS™ detecta señales críticas que requieren intervención directiva inmediata."
          : estado === "Watch"
          ? "BNS™ detecta señales tempranas que deben observarse antes de que escalen."
          : "BNS™ observa estabilidad con vigilancia predictiva activa.",
    };
  }, [
    leads,
    accionesEjecutivas,
    forecastIntelligence,
    pressureEngine,
    bnsMetrics,
    executiveHeatmap,
    tiempoRealActivo,
    groqRespuesta,
  ]);


  const memoryCorrelationEngine = useMemo(() => {
    const patrones: Array<{
      titulo: string;
      descripcion: string;
      similitud: number;
      severidad: "Alta" | "Media" | "Baja";
      evidencia: string[];
      accion: string;
    }> = [];

    const eventosAlta = signalEventEngine.eventos.filter(
      (evento) => evento.severidad === "Crítica" || evento.severidad === "Alta"
    ).length;

    const auditoriasAlta = auditTrail.filter((evento) => evento.severidad === "Alta").length;
    const cambiosDatos = auditTrail.filter((evento) => evento.tipo === "Datos").length;
    const eventosIA = auditTrail.filter((evento) => evento.tipo === "IA").length;
    const eventosPDF = auditTrail.filter((evento) => evento.tipo === "PDF").length;

    const leadsRiesgo = leads.filter((lead) => lead.riesgo === "Alto").length;
    const leadsFrios = leads.filter((lead) => lead.temperatura === "Frío").length;
    const accionesPendientes = accionesEjecutivas.filter(
      (accion) => accion.estado !== "Completada"
    ).length;

    if (eventosAlta >= 3 && pressureEngine.promedio >= 60) {
      patrones.push({
        titulo: "Patrón de presión ejecutiva recurrente",
        descripcion:
          "BNS™ correlaciona múltiples señales altas con presión organizacional. Este patrón suele preceder bloqueos de ejecución.",
        similitud: Math.min(96, 62 + eventosAlta * 7),
        severidad: "Alta",
        evidencia: [
          `${eventosAlta} señales críticas/altas activas`,
          `Pressure ${safePercent(pressureEngine.promedio)}%`,
          `${accionesPendientes} intervenciones pendientes`,
        ],
        accion: "Activar comité directivo de 30 minutos para desbloquear decisiones críticas.",
      });
    }

    if (leadsRiesgo + leadsFrios >= 8 && forecastIntelligence.confianza < 65) {
      patrones.push({
        titulo: "Patrón de debilitamiento comercial",
        descripcion:
          "El sistema identifica acumulación de señales comerciales frías o de alto riesgo con forecast vulnerable.",
        similitud: Math.min(94, 58 + (leadsRiesgo + leadsFrios) * 3),
        severidad: "Alta",
        evidencia: [
          `${leadsRiesgo} oportunidades en riesgo alto`,
          `${leadsFrios} oportunidades frías`,
          `Forecast confidence ${safePercent(forecastIntelligence.confianza)}%`,
        ],
        accion: "Repriorizar pipeline por probabilidad de cierre y reasignar ownership comercial.",
      });
    }

    if (executiveHeatmap.mayorDependencia && executiveHeatmap.mayorDependencia.dependenciaScore >= 70) {
      patrones.push({
        titulo: "Patrón de dependencia organizacional",
        descripcion:
          "BNS™ detecta concentración en un nodo ejecutivo. Este patrón aumenta riesgo si la operación depende de una sola persona.",
        similitud: executiveHeatmap.mayorDependencia.dependenciaScore,
        severidad: executiveHeatmap.mayorDependencia.dependenciaScore >= 85 ? "Alta" : "Media",
        evidencia: [
          `Nodo: ${executiveHeatmap.mayorDependencia.nombre}`,
          `Dependencia ${executiveHeatmap.mayorDependencia.dependenciaScore}%`,
          `Estado ${executiveHeatmap.mayorDependencia.estado}`,
        ],
        accion: "Distribuir aprobaciones, seguimiento y decisiones entre líderes secundarios.",
      });
    }

    if (cambiosDatos >= 1 && eventosIA >= 1 && eventosPDF >= 1) {
      patrones.push({
        titulo: "Ciclo completo de inteligencia ejecutiva",
        descripcion:
          "BNS™ registra una secuencia saludable: datos entran, IA interpreta y dirección genera briefing.",
        similitud: 88,
        severidad: "Baja",
        evidencia: [
          `${cambiosDatos} evento(s) de datos`,
          `${eventosIA} lectura(s) IA`,
          `${eventosPDF} PDF(s) generado(s)`,
        ],
        accion: "Guardar este ciclo como baseline para comparar futuras decisiones ejecutivas.",
      });
    }

    if (auditTrail.filter((evento) => evento.tipo === "Seguridad").length > 0) {
      patrones.push({
        titulo: "Patrón de seguridad y acceso",
        descripcion:
          "El sistema detectó intentos o eventos de seguridad. Esto ayuda a gobernanza y control C-Level.",
        similitud: 76,
        severidad: "Media",
        evidencia: auditTrail
          .filter((evento) => evento.tipo === "Seguridad")
          .slice(0, 3)
          .map((evento) => `${evento.hora}: ${evento.accion}`),
        accion: "Revisar roles, permisos y política de acceso por nivel directivo.",
      });
    }

    if (patrones.length === 0) {
      patrones.push({
        titulo: "Memoria en aprendizaje",
        descripcion:
          "BNS™ aún no tiene suficientes eventos correlacionados. Alimenta CSV, genera diagnósticos IA y usa Boardroom para crear historial.",
        similitud: 42,
        severidad: "Baja",
        evidencia: [
          `${auditTrail.length} eventos de auditoría`,
          `${signalEventEngine.eventos.length} señales activas`,
          `${leads.length} oportunidades registradas`,
        ],
        accion: "Conectar más fuentes y generar lecturas IA para fortalecer la memoria empresarial.",
      });
    }

    const indiceMemoria = Math.min(
      98,
      28 +
        Math.min(24, auditTrail.length * 2) +
        Math.min(20, signalEventEngine.eventos.length * 3) +
        Math.min(18, leads.length) +
        Math.min(8, ejecutivos.length * 2)
    );

    const estado =
      indiceMemoria >= 78
        ? "Memoria activa"
        : indiceMemoria >= 55
        ? "Aprendiendo patrones"
        : "Memoria inicial";

    return {
      patrones: patrones.sort((a, b) => b.similitud - a.similitud),
      indiceMemoria,
      estado,
      lectura:
        estado === "Memoria activa"
          ? "BNS™ ya cuenta con suficiente historial para correlacionar señales, auditoría y decisiones."
          : estado === "Aprendiendo patrones"
          ? "BNS™ empieza a reconocer secuencias entre datos, riesgo, IA y decisiones."
          : "BNS™ necesita más eventos para construir memoria empresarial confiable.",
    };
  }, [
    signalEventEngine,
    auditTrail,
    pressureEngine,
    forecastIntelligence,
    leads,
    accionesEjecutivas,
    executiveHeatmap,
    ejecutivos,
  ]);




  const scenarioSimulator = useMemo(() => {
    const baseBns = bnsMetrics.bnsScore;
    const basePressure = pressureEngine.promedio;
    const baseRevenueForecast = forecastIntelligence.confianza;
    const dependency = executiveHeatmap.mayorDependencia?.dependenciaScore || 0;
    const criticalCriticalSignals = signalEventEngine.criticos + signalEventEngine.altos;

    const escenarios = [
      {
        id: "pressure-up",
        nombre: "Presión +20%",
        hipotesis: "La demanda crece sin redistribuir carga ni resolver intervenciones pendientes.",
        bns: Math.max(12, baseBns - 12),
        pressure: Math.min(98, basePressure + 20),
        forecast: Math.max(10, baseRevenueForecast - 9),
        riesgo: basePressure + 20 >= 75 ? "Crítico" : "Alto",
        decision: "Congelar nuevas iniciativas y enfocar dirección en desbloqueo operativo.",
        lectura: "Si la presión sube sin coordinación, BNS™ anticipa fricción operativa y caída de velocidad ejecutiva.",
      },
      {
        id: "forecast-down",
        nombre: "Revenue Forecast -15%",
        hipotesis: "El pipeline pierde tracción por oportunidades frías, riesgo alto o falta de seguimiento.",
        bns: Math.max(10, baseBns - 10),
        pressure: Math.min(96, basePressure + 12),
        forecast: Math.max(8, baseRevenueForecast - 15),
        riesgo: baseRevenueForecast - 15 < 45 ? "Crítico" : "Alto",
        decision: "Activar war room comercial y priorizar oportunidades con mayor probabilidad de cierre.",
        lectura: "Una caída del forecast afecta predictibilidad y puede requerir intervención directa de Dirección.",
      },
      {
        id: "dependency-up",
        nombre: "Dependencia ejecutiva crítica",
        hipotesis: "Las decisiones y aprobaciones siguen concentradas en un solo nodo directivo.",
        bns: Math.max(10, baseBns - Math.round(dependency / 8)),
        pressure: Math.min(96, basePressure + Math.round(dependency / 6)),
        forecast: Math.max(10, baseRevenueForecast - Math.round(dependency / 10)),
        riesgo: dependency >= 80 ? "Crítico" : "Medio",
        decision: "Crear segundo nivel de decisión y transferir ownership de procesos críticos.",
        lectura: "La concentración ejecutiva puede convertirse en cuello de botella humano y ralentizar toda la organización.",
      },
      {
        id: "intervention-success",
        nombre: "Intervención exitosa",
        hipotesis: "Dirección cierra acciones críticas, reduce dependencia y enfoca seguimiento comercial.",
        bns: Math.min(98, baseBns + 11),
        pressure: Math.max(5, basePressure - 14),
        forecast: Math.min(96, baseRevenueForecast + 12),
        riesgo: "Controlado",
        decision: "Mantener cadencia semanal de intervención y registrar patrón como baseline.",
        lectura: "Si las intervenciones se ejecutan, BNS™ anticipa mejora de salud empresarial y forecast.",
      },
    ];

    const escenarioCritico = [...escenarios].sort((a, b) => {
      const rank: Record<string, number> = { Crítico: 4, Alto: 3, Medio: 2, Controlado: 1 };
      return rank[b.riesgo] - rank[a.riesgo];
    })[0];

    const decisionRecomendada =
      criticalCriticalSignals >= 3
        ? "Priorizar escenario de intervención inmediata: reducir presión, cerrar acciones críticas y redistribuir decisiones."
        : baseRevenueForecast < 55
        ? "Priorizar recuperación de forecast y seguimiento comercial intensivo."
        : dependency >= 70
        ? "Priorizar reducción de dependencia ejecutiva antes de escalar operación."
        : "Mantener monitoreo predictivo y usar escenarios como planeación semanal.";

    return {
      escenarios,
      escenarioCritico,
      decisionRecomendada,
      criticalCriticalSignals,
    };
  }, [
    bnsMetrics,
    pressureEngine,
    forecastIntelligence,
    executiveHeatmap,
    signalEventEngine,
  ]);



  const executiveLayers = useMemo(() => {
    const totalPipeline = revenueSegmentation.totalPipeline;
    const revenueAtRisk = revenueSegmentation.revenueAtRisk;
    const securedRevenue = revenueSegmentation.securedRevenue;
    const frozenRevenue = revenueSegmentation.frozenRevenue;
    const forecastGap = forecastIntelligence.metaEstimacion - forecastIntelligence.probable;
    const pipelineCoverage =
      forecastIntelligence.metaEstimacion > 0
        ? Number((totalPipeline / forecastIntelligence.metaEstimacion).toFixed(2))
        : 0;

    const winRate =
      leads.length > 0
        ? Math.round((leads.filter((lead) => lead.etapa === "Ganado").length / leads.length) * 100)
        : 0;

    const activeOpportunities = leads.filter(
      (lead) => lead.etapa !== "Ganado" && lead.etapa !== "Perdido"
    ).length;

    const avgDealSize = leads.length > 0 ? Math.round(totalPipeline / Math.max(1, leads.length)) : 0;

    const cfo = {
      title: "CFO Layer™",
      subtitle: "Caja, forecast y revenue comprometido",
      metrics: [
        { label: "Revenue at risk", value: formatoMoneda(safeNumber(revenueAtRisk)), note: `${safePercent(revenueSegmentation.riskPercent)}% del pipeline` },
        { label: "Forecast gap", value: formatoMoneda(safeNumber(forecastGap)), note: "Diferencia vs meta estimada" },
        { label: "Pipeline coverage", value: `${pipelineCoverage}x`, note: "Cobertura sobre meta" },
        { label: "Frozen revenue", value: formatoMoneda(safeNumber(frozenRevenue)), note: "Frío o sin próxima acción" },
      ],
      decision:
        revenueAtRisk > totalPipeline * 0.35
          ? "Proteger caja priorizando rescate de oportunidades críticas y forecast comprometido."
          : "Mantener vigilancia financiera y reforzar oportunidades con alta probabilidad de cierre.",
    };

    const cro = {
      title: "CRO Layer™",
      subtitle: "Conversión, velocity y eficiencia comercial",
      metrics: [
        { label: "Win rate", value: `${winRate}%`, note: "Ganados sobre total" },
        { label: "Active opps", value: `${activeOpportunities}`, note: "Oportunidades vivas" },
        { label: "Avg deal size", value: formatoMoneda(avgDealSize), note: "Ticket promedio pipeline" },
        { label: "Critical accounts", value: `${revenueSegmentation.topCriticalLeads.length}`, note: "Rescate prioritario" },
      ],
      decision:
        winRate < 20
          ? "Revisar calidad del pipeline y reforzar proceso de cierre."
          : "Acelerar oportunidades calientes y sostener ritmo comercial.",
    };

    const ceo = {
      title: "CEO Layer™",
      subtitle: "Riesgo sistémico, liderazgo y decisión",
      metrics: [
        { label: "Enterprise health", value: `${safeNumber(bnsMetrics.bnsScore)}/100`, note: "Índice BNS" },
        { label: "Pressure", value: `${safePercent(bnsMetrics.presion)}%`, note: "Presión organizacional" },
        { label: "Decision risk", value: predictiveEngine.riesgoPredictivo, note: "Riesgo predictivo" },
        { label: "Memory index", value: `${safeNumber(memoryCorrelationEngine.indiceMemoria)}`, note: memoryCorrelationEngine.estado },
      ],
      decision:
        bnsMetrics.presion >= 75
          ? "Intervenir liderazgo y redistribuir ownership antes de escalar operación."
          : "Mantener monitoreo y convertir señales en acciones directivas.",
    };

    return { cfo, cro, ceo };
  }, [
    revenueSegmentation,
    forecastIntelligence,
    leads,
    bnsMetrics,
    predictiveEngine,
    memoryCorrelationEngine,
  ]);


  const strategicIntelligence = useMemo(() => {
    const pressure = bnsMetrics.presion;
    const pipeline = revenueSegmentation.totalPipeline;
    const revenueAtRisk = revenueSegmentation.revenueAtRisk;
    const riskPercent = revenueSegmentation.riskPercent;
    const forecastConfidence = forecastIntelligence.confianza;
    const forecastGap = forecastIntelligence.metaEstimacion - forecastIntelligence.probable;
    const criticalOwners = revenueSegmentation.byOwner
      .filter((owner) => owner.critical > 0)
      .slice(0, 3)
      .map((owner) => owner.label);

    const externalPressureScore = Math.min(
      100,
      Math.round((pressure * 0.32) + ((100 - forecastConfidence) * 0.25) + (riskPercent * 0.28) + 18)
    );

    const internalAlignmentScore = Math.max(
      0,
      Math.round(100 - (pressure * 0.35) - (riskPercent * 0.28) - (criticalOwners.length * 8))
    );

    const strategicRiskScore = Math.min(
      100,
      Math.round((externalPressureScore * 0.35) + ((100 - internalAlignmentScore) * 0.35) + (riskPercent * 0.30))
    );

    const pestel = [
      {
        factor: "Político / Legal",
        lectura: "Gobernanza, trazabilidad, privacidad y permisos serán críticos para operar datos reales por empresa.",
        impacto: "Medio",
      },
      {
        factor: "Económico",
        lectura:
          forecastGap > 0
            ? `Existe brecha de forecast de ${formatoMoneda(safeNumber(forecastGap))} contra la meta estimada.`
            : "El forecast no muestra brecha negativa relevante frente a la meta.",
        impacto: forecastGap > 0 ? "Alto" : "Medio",
      },
      {
        factor: "Social",
        lectura: "La adopción dependerá de reducir captura manual y mostrar valor directo a dirección y mandos comerciales.",
        impacto: "Medio",
      },
      {
        factor: "Tecnológico",
        lectura: "Supabase, IA, CSV, WhatsApp y APIs permiten convertir señales dispersas en inteligencia directiva.",
        impacto: "Alto",
      },
      {
        factor: "Ecológico / Operativo",
        lectura: "La eficiencia operacional dependerá de bajar fricción, duplicidad y seguimiento manual.",
        impacto: pressure >= 70 ? "Alto" : "Medio",
      },
      {
        factor: "Legal / Compliance",
        lectura: "RLS, roles, auditoría y consentimiento deben quedar sólidos antes de escalar multiempresa.",
        impacto: "Alto",
      },
    ];

    const porter = [
      {
        fuerza: "Rivalidad competitiva",
        lectura: "Si el mercado compara solo por CRM o dashboard, BNS™ debe diferenciarse como capa de interpretación ejecutiva.",
        intensidad: "Alta",
      },
      {
        fuerza: "Amenaza de sustitutos",
        lectura: "CRM, BI y hojas de cálculo pueden sustituir datos, pero no decisión predictiva conectada.",
        intensidad: "Media",
      },
      {
        fuerza: "Poder de clientes",
        lectura:
          revenueAtRisk > 0
            ? `${formatoMoneda(safeNumber(revenueAtRisk))} en riesgo eleva sensibilidad a retrasos, precio y seguimiento.`
            : "Sin revenue crítico detectado, el poder del cliente se mantiene controlado.",
        intensidad: revenueAtRisk > 0 ? "Alta" : "Media",
      },
      {
        fuerza: "Poder de proveedores",
        lectura: "Dependencia de fuentes externas, APIs, WhatsApp y CRM exige arquitectura flexible y conectores reemplazables.",
        intensidad: "Media",
      },
      {
        fuerza: "Nuevos entrantes",
        lectura: "La entrada de herramientas AI-native presiona velocidad de innovación y claridad de propuesta de valor.",
        intensidad: "Alta",
      },
    ];

    const valueChain = [
      {
        actividad: "Atracción",
        lectura: "Medir origen, calidad y temperatura de oportunidades para evitar crecimiento falso del pipeline.",
        estado: revenueSegmentation.byTemperature.find((item) => item.label === "Frío")?.count ? "Vigilar" : "Estable",
      },
      {
        actividad: "Conversión",
        lectura: "La conversión depende de próxima acción clara, responsable y velocidad de seguimiento.",
        estado: riskPercent >= 30 ? "Presión" : "Estable",
      },
      {
        actividad: "Entrega / Operación",
        lectura: "La presión organizacional puede frenar promesas comerciales y afectar reputación.",
        estado: pressure >= 70 ? "Crítico" : "Vigilar",
      },
      {
        actividad: "Soporte",
        lectura: "WhatsApp, postventa y seguimiento deben conectarse para detectar abandono temprano.",
        estado: "Pendiente",
      },
      {
        actividad: "Dirección",
        lectura: "Boardroom debe convertir señales en intervenciones con dueño, fecha e impacto.",
        estado: "Activo",
      },
    ];

    const mckinsey7s = [
      {
        s: "Strategy",
        lectura: "La estrategia debe enfocarse en convertir datos operativos en decisiones ejecutivas recurrentes.",
        alineacion: "Media",
      },
      {
        s: "Structure",
        lectura: "La estructura necesita roles, permisos, ownership y vistas por capa CEO/CFO/CRO.",
        alineacion: internalAlignmentScore >= 70 ? "Alta" : "Media",
      },
      {
        s: "Systems",
        lectura: "Supabase, CSV, IA y reportes ya forman base del sistema; faltan conectores pasivos.",
        alineacion: "Media",
      },
      {
        s: "Shared Values",
        lectura: "BNS™ debe posicionarse como sistema nervioso, no como CRM.",
        alineacion: "Alta",
      },
      {
        s: "Skills",
        lectura: "La adopción requiere lectura ejecutiva, disciplina comercial, BI, IA y mejora continua.",
        alineacion: "Media",
      },
      {
        s: "Style",
        lectura: "El liderazgo debe operar por señales, no por intuición o seguimiento manual.",
        alineacion: pressure >= 70 ? "Baja" : "Media",
      },
      {
        s: "Staff",
        lectura: criticalOwners.length
          ? `Dependencia relevante en ${criticalOwners.join(", ")}.`
          : "No se detecta concentración crítica de responsables.",
        alineacion: criticalOwners.length ? "Baja" : "Media",
      },
    ];

    const came = [
      {
        tipo: "Corregir",
        origen: "Debilidades",
        accion:
          pressure >= 70
            ? "Reducir saturación operativa y eliminar cuellos de botella antes de escalar demanda."
            : "Corregir captura incompleta y mejorar trazabilidad de acciones.",
      },
      {
        tipo: "Afrontar",
        origen: "Amenazas",
        accion:
          riskPercent >= 30
            ? "Afrontar riesgo de forecast priorizando oportunidades de alto monto y alto riesgo."
            : "Afrontar competencia con diferenciación de inteligencia ejecutiva.",
      },
      {
        tipo: "Mantener",
        origen: "Fortalezas",
        accion: "Mantener la capa de lectura ejecutiva, boardroom, IA y segmentación de revenue.",
      },
      {
        tipo: "Explotar",
        origen: "Oportunidades",
        accion: "Explotar BNS™ como plataforma consultiva para CEOs, CFOs, CROs, advisors y empresas en crecimiento.",
      },
    ];

    const soar = [
      {
        eje: "Strengths",
        lectura: "BNS™ ya conecta forecast, presión, pipeline, IA, CSV, roles y lectura ejecutiva.",
      },
      {
        eje: "Opportunities",
        lectura: "Crecer hacia Consulting Mode, CFO View, WhatsApp Intelligence y conectores CRM/ERP.",
      },
      {
        eje: "Aspirations",
        lectura: "Convertirse en el sistema nervioso ejecutivo que detecta fricción antes de que afecte caja y crecimiento.",
      },
      {
        eje: "Results",
        lectura: "Medir reducción de revenue en riesgo, mejora de forecast confidence, velocidad de cierre y disminución de presión.",
      },
    ];

    return {
      externalPressureScore,
      internalAlignmentScore,
      strategicRiskScore,
      pestel,
      porter,
      valueChain,
      mckinsey7s,
      came,
      soar,
      conclusion:
        strategicRiskScore >= 70
          ? "La empresa requiere intervención estratégica: presión externa, riesgo comercial y alineación interna deben conectarse a acciones ejecutivas."
          : strategicRiskScore >= 45
          ? "La empresa muestra señales estratégicas bajo vigilancia. BNS™ debe priorizar forecast, ownership y automatización de señales."
          : "La empresa mantiene una posición estratégica estable con oportunidad de escalar inteligencia ejecutiva.",
    };
  }, [
    bnsMetrics,
    revenueSegmentation,
    forecastIntelligence,
  ]);

  const enterpriseGraph = useMemo(() => {
    const nodes: Array<{
      id: string;
      label: string;
      tipo: "Empresa" | "Signal" | "Leader" | "Risk" | "Decision" | "Data";
      estado: "Critical" | "Watch" | "Stable" | "Info";
      valor: string;
    }> = [];

    const edges: Array<{
      from: string;
      to: string;
      label: string;
      fuerza: "Alta" | "Media" | "Baja";
    }> = [];

    nodes.push({
      id: "empresa",
      label: nombreEmpresa,
      tipo: "Empresa",
      estado:
        signalEventEngine?.estado === "Critical"
          ? "Critical"
          : signalEventEngine?.estado === "Watch"
          ? "Watch"
          : "Stable",
      valor: `${safeNumber(bnsMetrics.bnsScore)}/100`,
    });

    nodes.push({
      id: "forecast",
      label: "Revenue Forecast",
      tipo: "Signal",
      estado: forecastIntelligence.confianza < 50 ? "Critical" : forecastIntelligence.confianza < 68 ? "Watch" : "Stable",
      valor: `${safePercent(forecastIntelligence.confianza)}%`,
    });

    nodes.push({
      id: "pressure",
      label: "Pressure",
      tipo: "Signal",
      estado: pressureEngine.promedio >= 70 ? "Critical" : pressureEngine.promedio >= 50 ? "Watch" : "Stable",
      valor: `${safePercent(pressureEngine.promedio)}%`,
    });

    nodes.push({
      id: "memory",
      label: "Memory",
      tipo: "Data",
      estado: memoryCorrelationEngine.indiceMemoria >= 78 ? "Stable" : memoryCorrelationEngine.indiceMemoria >= 55 ? "Watch" : "Info",
      valor: `${safeNumber(memoryCorrelationEngine.indiceMemoria)}`,
    });

    if (executiveHeatmap.mayorDependencia) {
      nodes.push({
        id: "dependency",
        label: executiveHeatmap.mayorDependencia.nombre,
        tipo: "Leader",
        estado: executiveHeatmap.mayorDependencia.dependenciaScore >= 80 ? "Critical" : "Watch",
        valor: `${executiveHeatmap.mayorDependencia.dependenciaScore}% dep.`,
      });
    }

    if (executiveHeatmap.mayorRiesgo) {
      nodes.push({
        id: "risk-leader",
        label: executiveHeatmap.mayorRiesgo.nombre,
        tipo: "Risk",
        estado: executiveHeatmap.mayorRiesgo.riesgoScore >= 75 ? "Critical" : "Watch",
        valor: `${executiveHeatmap.mayorRiesgo.riesgoScore}% risk`,
      });
    }

    signalEventEngine.eventos.slice(0, 3).forEach((evento, index) => {
      nodes.push({
        id: `signal-${index}`,
        label: evento.titulo,
        tipo: "Risk",
        estado: evento.severidad === "Crítica" ? "Critical" : evento.severidad === "Alta" ? "Watch" : "Info",
        valor: evento.severidad,
      });

      edges.push({
        from: "empresa",
        to: `signal-${index}`,
        label: evento.tipo,
        fuerza: evento.severidad === "Crítica" ? "Alta" : evento.severidad === "Alta" ? "Media" : "Baja",
      });
    });

    nodes.push({
      id: "decision",
      label: "Board Decision",
      tipo: "Decision",
      estado: scenarioSimulator.escenarioCritico.riesgo === "Crítico" ? "Critical" : scenarioSimulator.escenarioCritico.riesgo === "Alto" ? "Watch" : "Stable",
      valor: scenarioSimulator.escenarioCritico.nombre,
    });

    edges.push({ from: "empresa", to: "forecast", label: "Revenue", fuerza: "Alta" });
    edges.push({ from: "empresa", to: "pressure", label: "Ops", fuerza: "Alta" });
    edges.push({ from: "empresa", to: "memory", label: "History", fuerza: "Media" });
    edges.push({ from: "forecast", to: "decision", label: "Impact", fuerza: "Alta" });
    edges.push({ from: "pressure", to: "decision", label: "Friction", fuerza: "Alta" });

    if (executiveHeatmap.mayorDependencia) {
      edges.push({ from: "dependency", to: "pressure", label: "Bottleneck", fuerza: "Alta" });
      edges.push({ from: "dependency", to: "decision", label: "Ownership", fuerza: "Media" });
    }

    if (executiveHeatmap.mayorRiesgo) {
      edges.push({ from: "risk-leader", to: "decision", label: "Risk", fuerza: "Media" });
    }

    return {
      nodes,
      edges,
      criticalNodes: nodes.filter((node) => node.estado === "Critical").length,
      watchNodes: nodes.filter((node) => node.estado === "Watch").length,
      lectura:
        nodes.filter((node) => node.estado === "Critical").length > 0
          ? "Enterprise Graph™ detecta nodos críticos conectados a decisiones del Boardroom."
          : nodes.filter((node) => node.estado === "Watch").length > 0
          ? "Enterprise Graph™ detecta nodos bajo vigilancia ejecutiva."
          : "Enterprise Graph™ observa estabilidad estructural en los nodos principales.",
    };
  }, [
    nombreEmpresa,
    bnsMetrics,
    forecastIntelligence,
    pressureEngine,
    memoryCorrelationEngine,
    executiveHeatmap,
    signalEventEngine,
    scenarioSimulator,
  ]);



  const documentosLegales = {
    privacidad: {
      titulo: "Aviso de privacidad",
      descripcion:
        "Documento visible para explicar cómo BNS tratará datos personales y empresariales.",
      contenido: [
        "BNS™ solicitará únicamente la información necesaria para operar el diagnóstico empresarial.",
        "Los datos capturados incluyen nombre, correo, cargo, teléfono, empresa, redes, sitio web y fuentes autorizadas.",
        "La información no debe venderse, compartirse ni exponerse a terceros sin consentimiento explícito.",
        "Cuando se conecte Supabase, cada usuario solo podrá ver empresas donde tenga permisos asignados.",
        "El usuario podrá solicitar eliminación, corrección o actualización de sus datos conforme a la política vigente.",
      ],
    },
    tratamiento: {
      titulo: "Tratamiento de datos",
      descripcion:
        "Explica qué datos usa BNS y para qué fines operativos, analíticos y de IA.",
      contenido: [
        "Los datos empresariales se usarán para generar diagnósticos, alertas, reportes y recomendaciones.",
        "Las métricas actuales son simuladas hasta conectar fuentes reales como Supabase, Groq, WhatsApp o APIs externas.",
        "La IA no debe utilizar datos privados sin autorización expresa del responsable de la empresa.",
        "Los reportes generados pertenecen a la empresa registrada y a los usuarios autorizados por rol.",
        "Las conexiones externas deberán aprobarse desde la sección de permisos y seguridad.",
      ],
    },
    permisos: {
      titulo: "Política de permisos por rol",
      descripcion:
        "Define qué puede hacer cada tipo de usuario dentro de una empresa registrada.",
      contenido: [
        "Owner: control total de empresa, usuarios, fuentes, reportes, pagos y eliminación.",
        "Admin: administra usuarios, fuentes, configuración y reportes.",
        "Manager: puede operar módulos, revisar tableros y tomar acciones dentro de su área.",
        "Analyst: puede analizar información, generar reportes y revisar diagnósticos.",
        "Viewer: solo lectura y requiere aprobación de Owner o Admin autorizado.",
        "El departamento define el área funcional del usuario; el rol define sus permisos de acceso.",
      ],
    },
  };


  function mostrarToastBNS(
    tipo: "ok" | "error" | "info",
    titulo: string,
    mensaje: string
  ) {
    setToastBNS({ tipo, titulo, mensaje });

    window.setTimeout(() => {
      setToastBNS(null);
    }, 5200);
  }

  function registrarAuditoria(
    tipo: AuditEvent["tipo"],
    accion: string,
    descripcion: string,
    severidad: AuditEvent["severidad"] = "Baja"
  ) {
    const evento: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      hora: new Date().toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "medium",
      }),
      usuario: usuario.nombre || usuario.email || "Usuario BNS",
      rol: usuario.rol,
      tipo,
      accion,
      descripcion,
      severidad,
    };

    setAuditTrail((actual) => [evento, ...actual].slice(0, 120));
  }

  function registrarEventoVivo(
    tipo: LiveEvent["tipo"],
    titulo: string,
    descripcion: string,
    severidad: LiveEvent["severidad"] = "Baja"
  ) {
    const evento: LiveEvent = {
      id: `live-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      tipo,
      titulo,
      descripcion,
      severidad,
      workspace: nombreEmpresa,
    };

    setLiveEvents((actual) => [evento, ...actual].slice(0, 80));
  }






  async function generarDiagnosticoGroq() {
    try {
      setGroqGenerando(true);
      setGroqUltimaLectura("Groq está analizando señales empresariales...");

      const response = await fetch("/api/groq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          empresa,
          bnsMetrics,
          forecast: forecastIntelligence,
          pressure: pressureEngine,
          predictive: predictiveEngine,
          executiveHeatmap,
          timeline: timelineNeural,
          strategic: strategicAnalysis,
          leads,
          ejecutivos,
          acciones: accionesEjecutivas,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        const mensaje =
          data?.error ||
          "No se pudo generar diagnóstico con Groq. Revisa GROQ_API_KEY y el API route.";
        setGroqUltimaLectura(mensaje);
        mostrarToastBNS("error", "Groq no respondió", mensaje);
        return;
      }

      setGroqRespuesta(data.respuesta || "Groq no devolvió contenido.");
      setGroqUltimaLectura(`Última lectura IA: ${new Date().toLocaleTimeString("es-MX")}`);
      registrarAuditoria(
        "IA",
        "Diagnóstico Groq generado",
        "Groq analizó empresa, forecast, presión, señales, timeline y acciones.",
        "Alta"
      );
      registrarEventoVivo(
        "AI",
        "Lectura ejecutiva IA generada",
        "Groq produjo una lectura para Boardroom y Executive Intelligence™.",
        "Alta"
      );
      mostrarToastBNS("ok", "Diagnosis IA generado", "Groq analizó las señales actuales de BNS™.");
    } catch (error) {
      console.error("BNS Groq diagnostic error:", error);
      setGroqUltimaLectura("Error inesperado al conectar con Groq.");
      mostrarToastBNS(
        "error",
        "Error IA",
        "No se pudo conectar con el motor Groq desde BNS™."
      );
    } finally {
      setGroqGenerando(false);
    }
  }

  function actualizarUsuario(campo: keyof Usuario, valor: string) {
    setUsuario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function recuperarPassword() {
    if (usuario.email.trim() === "") {
      mostrarToastBNS("info", "Email requerido", "Ingresa tu email para enviar recuperación de contraseña.");
      return;
    }

    try {
      setProcesandoAuth(true);
      setMensajeAuth("Enviando correo de recuperación...");

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}?reset=true`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(
        usuario.email.trim(),
        {
          redirectTo,
        }
      );

      if (error) {
        setMensajeAuth(`No se pudo enviar recuperación: ${error.message}`);
        mostrarToastBNS(
          "error",
          "No se pudo enviar recuperación",
          error.message.includes("rate limit")
            ? "Supabase limitó temporalmente el envío de correos. Espera unos minutos y vuelve a intentar."
            : error.message
        );
        return;
      }

      setMensajeAuth("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
      mostrarToastBNS(
        "ok",
        "Correo enviado",
        "Revisa tu bandeja de entrada para continuar con la recuperación."
      );
      setModoAuth("login");
    } catch (error) {
      console.error("BNS Auth recovery error:", error);
      setMensajeAuth("Error inesperado al enviar recuperación.");
    } finally {
      setProcesandoAuth(false);
    }
  }

  async function actualizarPasswordRecuperacion() {
    if (nuevaPasswordReset.trim().length < 6) {
      mostrarToastBNS("info", "Contraseña muy corta", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevaPasswordReset !== confirmarPasswordReset) {
      mostrarToastBNS("error", "Contraseñas distintas", "Confirma que ambas contraseñas sean iguales.");
      return;
    }

    try {
      setProcesandoAuth(true);
      setMensajeAuth("Actualizando contraseña segura...");

      const { error } = await supabase.auth.updateUser({
        password: nuevaPasswordReset,
      });

      if (error) {
        setMensajeAuth(`No se pudo actualizar contraseña: ${error.message}`);
        mostrarToastBNS("error", "No se pudo actualizar", error.message);
        return;
      }

      setMensajeAuth("Contraseña actualizada. Ya puedes entrar con tu nueva contraseña.");
      mostrarToastBNS("ok", "Contraseña actualizada", "Ya puedes entrar con tu nueva contraseña.");
      setNuevaPasswordReset("");
      setConfirmarPasswordReset("");
      setModoResetPassword(false);
      setModoAuth("login");

      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.origin);
      }
    } catch (error) {
      console.error("BNS Auth update password error:", error);
      setMensajeAuth("Error inesperado al actualizar contraseña.");
    } finally {
      setProcesandoAuth(false);
    }
  }

  async function iniciarSesion() {
    if (usuario.email.trim() === "" || password.trim() === "") {
      alert("Ingresa email y contraseña.");
      return;
    }

    try {
      setProcesandoAuth(true);
      setMensajeAuth("Iniciando sesión con Supabase Auth...");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuario.email.trim(),
        password,
      });

      if (error) {
        setMensajeAuth(`No se pudo iniciar sesión: ${error.message}`);
        alert(`No se pudo iniciar sesión: ${error.message}`);
        return;
      }

      if (data.user) {
        setSesionActiva(true);
        setAuthConectado(true);
        setAuthUserId(data.user.id);
        setMensajeAuth("Sesión iniciada con Supabase Auth.");
        setTabActiva("entrada");
      }
    } catch (error) {
      console.error("BNS Auth login error:", error);
      setMensajeAuth("Error inesperado al iniciar sesión.");
    } finally {
      setProcesandoAuth(false);
    }
  }

  async function crearCuenta() {
    if (
      usuario.nombre.trim() === "" ||
      usuario.email.trim() === "" ||
      password.trim() === ""
    ) {
      alert("Completa nombre, email y contraseña.");
      return;
    }

    if (!aceptaPrivacidad || !aceptaAutorizacion || !aceptaTratamiento) {
      alert("Debes aceptar privacidad, tratamiento de datos y autorización para continuar.");
      return;
    }

    if (usuario.rol === "Viewer") {
      alert("El rol Viewer / Espectador requiere aprobación de un usuario autorizado dentro de la empresa.");
      setModoAuth("solicitar");
      return;
    }

    try {
      setProcesandoAuth(true);
      setMensajeAuth("Creando cuenta real en Supabase Auth...");

      const { data, error } = await supabase.auth.signUp({
        email: usuario.email.trim(),
        password,
        options: {
          data: {
            nombre: usuario.nombre,
            cargo: usuario.cargo,
            departamento: usuario.departamento,
            rol: usuario.rol,
          },
        },
      });

      if (error) {
        setMensajeAuth(`No se pudo crear cuenta: ${error.message}`);
        alert(`No se pudo crear cuenta: ${error.message}`);
        return;
      }

      if (data.user) {
        setSesionActiva(true);
        setAuthConectado(true);
        setAuthUserId(data.user.id);
        setMensajeAuth(
          data.session
            ? "Cuenta creada y sesión activa con Supabase Auth."
            : "Cuenta creada. Revisa si Supabase solicita confirmación por correo."
        );
        setTabActiva("entrada");
      }
    } catch (error) {
      console.error("BNS Auth signup error:", error);
      setMensajeAuth("Error inesperado al crear cuenta.");
    } finally {
      setProcesandoAuth(false);
    }
  }

  function solicitarAcceso() {
    if (
      usuario.nombre.trim() === "" ||
      usuario.email.trim() === "" ||
      empresaSolicitada.trim() === "" ||
      motivoAcceso.trim() === ""
    ) {
      alert("Completa tus datos, empresa solicitada y motivo de acceso.");
      return;
    }

    alert(
      "Solicitud enviada. Un Owner, Dirección General o administrador de la empresa deberá aprobar el acceso."
    );
  }

  async function cerrarSesion() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("BNS Auth logout error:", error);
    }

    setSesionActiva(false);
    setAuthConectado(false);
    setAuthUserId(null);
    setPassword("");
    setTabActiva("entrada");
    setMensajeAuth("Sesión cerrada.");
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sesionActiva: false,
        usuario,
        empresa,
        miembros,
        url,
        analizado,
        tabActiva: "entrada",
        empresaSupabaseId,
        authUserId: null,
      })
    );
  }

  function actualizarEmpresa(campo: keyof Empresa, valor: string) {
    setEmpresa((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    if (campo === "sitio") {
      setUrl(valor);
    }
  }


  async function verificarConexionSupabase() {
    try {
      const { error } = await supabase.from("empresas").select("id").limit(1);

      if (error) {
        setSupabaseConectado(false);
        setMensajeSupabase(`Supabase con error: ${error.message}`);
        return;
      }

      setSupabaseConectado(true);
      setMensajeSupabase("Supabase conectado. Base BNS™ activa.");
    } catch (error) {
      setSupabaseConectado(false);
      setMensajeSupabase("No se pudo validar conexión con Supabase.");
      console.error("BNS Supabase connection error:", error);
    }
  }

  async function cargarDatosSupabase(empresaId?: string | null) {
    if (!empresaId) return;

    try {
      setSincronizandoSupabase(true);

      const [leadsResult, accionesResult, ejecutivosResult] = await Promise.all([
        supabase
          .from("leads")
          .select("*")
          .eq("empresa_id", empresaId)
          .order("created_at", { ascending: false }),
        supabase
          .from("acciones")
          .select("*")
          .eq("empresa_id", empresaId)
          .order("created_at", { ascending: false }),
        supabase
          .from("ejecutivos")
          .select("*")
          .eq("empresa_id", empresaId)
          .order("created_at", { ascending: false }),
      ]);

      if (leadsResult.error) throw leadsResult.error;
      if (accionesResult.error) throw accionesResult.error;
      if (ejecutivosResult.error) throw ejecutivosResult.error;

      const leadsDB: Lead[] = (leadsResult.data || []).map((item) => ({
        id: item.id,
        empresa: item.cliente || "",
        contacto: item.contacto || "",
        email: "",
        telefono: "",
        monto: String(item.monto || "0"),
        etapa: (item.etapa || "Nuevo") as EtapaLead,
        temperatura: (item.temperatura || "Tibio") as TemperaturaLead,
        riesgo: (item.riesgo || "Medio") as RiesgoLead,
        proximaAccion: item.proxima_accion || "",
        notas: "",
      }));

      const accionesDB: AccionEjecutiva[] = (accionesResult.data || []).map((item) => ({
        id: item.id,
        titulo: item.titulo || "",
        responsable: item.responsable || "",
        prioridad: (item.prioridad || "Media") as PrioridadAccion,
        estado: (item.estado || "Pendiente") as EstadoAccion,
        fechaCompromiso: item.fecha || "",
        leadRelacionado: "",
        impacto: (item.impacto || "Medio") as ImpactoAccion,
        recomendacionBNS: item.recomendacion || "",
        notas: "",
      }));

      const ejecutivosDB: EjecutivoBNS[] = (ejecutivosResult.data || []).map((item) => ({
        id: item.id,
        nombre: item.nombre || "",
        lider: item.lider || "",
        area: (item.area || "Comercial") as AreaEjecutiva,
        cargo: item.cargo || "",
        pipeline: "0",
        revenue: "0",
        conversion: "0",
        velocidad: "Media",
        riesgo: "Medio",
        estado: "Estable",
        dependencia: "Media",
      }));

      setLeads(leadsDB);
      setAccionesEjecutivas(accionesDB);
      setEjecutivos(ejecutivosDB);
      setMensajeSupabase("Datos sincronizados desde Supabase.");
    } catch (error) {
      console.error("BNS Supabase load error:", error);
      setMensajeSupabase("Supabase conectado, pero no se pudieron cargar datos.");
    } finally {
      setSincronizandoSupabase(false);
    }
  }

  async function cargarEmpresasDisponibles() {
    if (!authUserId) {
      setEmpresasDisponibles([]);
      setMensajeSupabase("Esperando usuario autenticado.");
      return;
    }

    try {
      setCargandoEmpresas(true);

      const { data: relaciones, error: relacionesError } = await supabase
        .from("empresa_usuarios")
        .select(`
          empresa_id,
          empresas (
            id,
            nombre,
            giro,
            sitio,
            responsable,
            objetivo,
            created_at
          )
        `)
        .eq("user_id", authUserId)
        .eq("estado", "Activo");

      if (relacionesError) throw relacionesError;

      const empresasDB: EmpresaWorkspace[] = (relaciones || [])
        .map((item: any) => item.empresas)
        .filter(Boolean)
        .map((item: any) => ({
          id: item.id,
          nombre: item.nombre || "Empresa sin nombre",
          giro: item.giro || "",
          sitio: item.sitio || "",
          responsable: item.responsable || "",
          objetivo: item.objetivo || "",
          created_at: item.created_at || "",
        }))
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

      setEmpresasDisponibles(empresasDB);

      if (empresasDB.length === 0) {
        setEmpresaSupabaseId(null);
        setEmpresa({
          nombre: "",
          giro: "",
          sitio: "",
          whatsapp: "",
          instagram: "",
          facebook: "",
          tamano: "",
          objetivo: "",
          responsable: usuario.nombre || "",
        });
        setLeads([]);
        setAccionesEjecutivas([]);
        setEjecutivos([]);
        setMensajeSupabase("Este usuario aún no tiene empresas asignadas.");
        return;
      }

      const empresaActual =
        empresasDB.find((item) => item.id === empresaSupabaseId) || empresasDB[0];

      setEmpresaSupabaseId(empresaActual.id);
      setEmpresa((actual) => ({
        ...actual,
        nombre: empresaActual.nombre || "",
        giro: empresaActual.giro || "",
        sitio: empresaActual.sitio || "",
        responsable: empresaActual.responsable || usuario.nombre || "",
        objetivo: empresaActual.objetivo || "",
      }));

      await cargarDatosSupabase(empresaActual.id);

      setMensajeSupabase(`${empresasDB.length} workspace(s) cargados para este usuario.`);
    } catch (error) {
      console.error("BNS Supabase empresas load error:", error);
      setMensajeSupabase("No se pudieron cargar empresas desde Supabase.");
    } finally {
      setCargandoEmpresas(false);
    }
  }

  async function seleccionarEmpresaWorkspace(workspace: EmpresaWorkspace) {
    setEmpresaSupabaseId(workspace.id);
    setEmpresa((actual) => ({
      ...actual,
      nombre: workspace.nombre || "",
      giro: workspace.giro || "",
      sitio: workspace.sitio || "",
      responsable: workspace.responsable || usuario.nombre || "",
      objetivo: workspace.objetivo || "",
    }));

    setLeads([]);
    setAccionesEjecutivas([]);
    setEjecutivos([]);
    setFilasImportadas([]);
    setArchivoImportado("");
    setGroqRespuesta("");
    setGroqUltimaLectura("IA ejecutiva lista para analizar datos reales.");

    await cargarDatosSupabase(workspace.id);

    registrarAuditoria(
      "Gobernanza",
      "Cambio de empresa activa",
      `Se activó el workspace ${workspace.nombre}.`,
      "Media"
    );

    mostrarToastBNS(
      "ok",
      "Workspace activo",
      `${workspace.nombre} ahora alimenta Boardroom, IA, forecast y señales.`
    );

    navegarA("centro");
  }

  function iniciarNuevoWorkspace() {
    setEmpresaSupabaseId(null);
    setEmpresa({
      nombre: "",
      giro: "",
      sitio: "",
      whatsapp: "",
      instagram: "",
      facebook: "",
      tamano: "",
      objetivo: "",
      responsable: usuario.nombre || "",
    });

    setLeads([]);
    setAccionesEjecutivas([]);
    setEjecutivos([]);
    setFilasImportadas([]);
    setArchivoImportado("");
    setMensajeSupabase("Nuevo workspace listo. Registra empresa para guardarlo en Supabase.");
    navegarA("entrada");
  }


  async function guardarEmpresaSupabase() {
    if (empresa.nombre.trim() === "") return null;

    try {
      setSincronizandoSupabase(true);

      const payload = {
        nombre: empresa.nombre,
        giro: empresa.giro || null,
        sitio: empresa.sitio || url || null,
        responsable: empresa.responsable || usuario.nombre || null,
        objetivo: empresa.objetivo || null,
        meta_mensual: 0,
      };

      if (empresaSupabaseId) {
        const { data, error } = await supabase
          .from("empresas")
          .update(payload)
          .eq("id", empresaSupabaseId)
          .select("id")
          .single();

        if (error) throw error;

        if (authUserId) {
          await supabase.from("empresa_usuarios").insert({
            empresa_id: data.id,
            user_id: authUserId,
            nombre: usuario.nombre || data.id,
            email: usuario.email,
            rol: usuario.rol,
            departamento: usuario.departamento,
            estado: "Activo",
          });
        }

        setMensajeSupabase("Empresa actualizada en Supabase.");
        await cargarEmpresasDisponibles();
        return data.id as string;
      }

      const { data, error } = await supabase
        .from("empresas")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;

      setEmpresaSupabaseId(data.id);

      if (authUserId) {
        await supabase.from("empresa_usuarios").insert({
          empresa_id: data.id,
          user_id: authUserId,
          nombre: usuario.nombre || "Owner",
          email: usuario.email,
          rol: usuario.rol,
          departamento: usuario.departamento,
          estado: "Activo",
        });
      }

      setSupabaseConectado(true);
      setMensajeSupabase("Empresa guardada en Supabase.");
      await cargarEmpresasDisponibles();
      return data.id as string;
    } catch (error) {
      console.error("BNS Supabase save empresa error:", error);
      setMensajeSupabase("No se pudo guardar la empresa en Supabase.");
      return null;
    } finally {
      setSincronizandoSupabase(false);
    }
  }

  async function guardarLeadSupabase(lead: Lead) {
    const empresaId = empresaSupabaseId || (await guardarEmpresaSupabase());
    if (!empresaId) return;

    const montoLimpio = Number(lead.monto.replace(/[^0-9.]/g, ""));

    const { error } = await supabase.from("leads").insert({
      empresa_id: empresaId,
      cliente: lead.empresa,
      contacto: lead.contacto,
      monto: Number.isFinite(montoLimpio) ? montoLimpio : 0,
      etapa: lead.etapa,
      temperatura: lead.temperatura,
      responsable: usuario.nombre || empresa.responsable || "Sin responsable",
      lider: empresa.responsable || usuario.nombre || "Dirección General",
      riesgo: lead.riesgo,
      proxima_accion: lead.proximaAccion,
    });

    if (error) {
      console.error("BNS Supabase save lead error:", error);
      setMensajeSupabase("Lead guardado localmente, pero no se pudo sincronizar.");
      return;
    }

    setMensajeSupabase("Lead sincronizado con Supabase.");
  }

  async function guardarAccionSupabase(accion: AccionEjecutiva) {
    const empresaId = empresaSupabaseId || (await guardarEmpresaSupabase());
    if (!empresaId) return;

    const { error } = await supabase.from("acciones").insert({
      empresa_id: empresaId,
      titulo: accion.titulo,
      area: "Comercial",
      responsable: accion.responsable,
      lider: empresa.responsable || usuario.nombre || "Dirección General",
      prioridad: accion.prioridad,
      estado: accion.estado,
      fecha: accion.fechaCompromiso && accion.fechaCompromiso !== "Sin fecha" ? accion.fechaCompromiso : null,
      impacto: accion.impacto,
      recomendacion: accion.recomendacionBNS,
    });

    if (error) {
      console.error("BNS Supabase save accion error:", error);
      setMensajeSupabase("Acción guardada localmente, pero no se pudo sincronizar.");
      return;
    }

    setMensajeSupabase("Acción sincronizada con Supabase.");
  }

  async function guardarEjecutivoSupabase(ejecutivo: EjecutivoBNS) {
    const empresaId = empresaSupabaseId || (await guardarEmpresaSupabase());
    if (!empresaId) return;

    const { error } = await supabase.from("ejecutivos").insert({
      empresa_id: empresaId,
      nombre: ejecutivo.nombre,
      lider: ejecutivo.lider,
      area: ejecutivo.area,
      cargo: ejecutivo.cargo,
      costo_mensual: 0,
    });

    if (error) {
      console.error("BNS Supabase save ejecutivo error:", error);
      setMensajeSupabase("Ejecutivo guardado localmente, pero no se pudo sincronizar.");
      return;
    }

    setMensajeSupabase("Ejecutivo sincronizado con Supabase.");
  }

  async function registrarEmpresa() {
    if (empresa.nombre.trim() === "") {
      alert("Primero escribe el nombre de la empresa.");
      return;
    }

    if (empresa.responsable.trim() === "") {
      setEmpresa((actual) => ({
        ...actual,
        responsable: usuario.nombre,
      }));
    }

    await guardarEmpresaSupabase();
    setTabActiva("centro");
  }

  function actualizarNuevoMiembro(campo: keyof Miembro, valor: string) {
    setNuevoMiembro((actual) => ({
      ...actual,
      [campo]: valor as Rol,
    }));
  }

  function agregarMiembro() {
    if (usuariosUsados >= limiteUsuarios) {
      alert(`Tu plan ${planActual} permite máximo ${limiteUsuarios} usuarios.`);
      return;
    }

    if (nuevoMiembro.nombre.trim() === "" || nuevoMiembro.email.trim() === "") {
      alert("Completa nombre y email del miembro.");
      return;
    }

    const estado =
      nuevoMiembro.rol === "Viewer" ? "Pendiente de aprobación" : "Invitación enviada";

    setMiembros((actual) => [
      ...actual,
      {
        ...nuevoMiembro,
        estado,
      },
    ]);

    setNuevoMiembro({
      nombre: "",
      email: "",
      rol: "Viewer",
      estado: "Pendiente de aprobación",
    });
  }

  function actualizarNuevoLead(campo: keyof Lead, valor: string) {
    setNuevoLead((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function agregarLead() {
    if (nuevoLead.empresa.trim() === "" || nuevoLead.contacto.trim() === "") {
      alert("Agrega al menos empresa y contacto del lead.");
      return;
    }

    const lead: Lead = {
      ...nuevoLead,
      id: `${Date.now()}`,
      monto: nuevoLead.monto.trim() === "" ? "0" : nuevoLead.monto.trim(),
      proximaAccion:
        nuevoLead.proximaAccion.trim() === ""
          ? "Definir siguiente contacto"
          : nuevoLead.proximaAccion.trim(),
    };

    setLeads((actual) => [lead, ...actual]);
    await guardarLeadSupabase(lead);
    setNuevoLead(leadVacio);
    setTabActiva("clientes");
  }

  function avanzarLead(id: string) {
    const flujo: EtapaLead[] = ["Nuevo", "Contactado", "Propuesta", "Negociación", "Ganado"];

    setLeads((actual) =>
      actual.map((lead) => {
        if (lead.id !== id) return lead;
        const indiceActual = flujo.indexOf(lead.etapa);
        const siguiente = flujo[Math.min(indiceActual + 1, flujo.length - 1)] || lead.etapa;
        return { ...lead, etapa: siguiente };
      })
    );
  }

  function marcarLeadPerdido(id: string) {
    setLeads((actual) =>
      actual.map((lead) =>
        lead.id === id ? { ...lead, etapa: "Perdido", temperatura: "Frío", riesgo: "Alto" } : lead
      )
    );
  }

  function eliminarLead(id: string) {
    setLeads((actual) => actual.filter((lead) => lead.id !== id));
  }

  function actualizarNuevaAccion(campo: keyof AccionEjecutiva, valor: string) {
    setNuevaAccion((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function generarRecomendacionBNSAccion(accion: AccionEjecutiva) {
    const lead = leads.find((item) => item.empresa === accion.leadRelacionado);
    const titulo = accion.titulo.trim().toLowerCase();
    const fecha = accion.fechaCompromiso ? ` antes del ${accion.fechaCompromiso}` : " en las próximas 24 a 48 horas";

    if (lead) {
      if (lead.riesgo === "Alto" || lead.temperatura === "Caliente") {
        return `BNS™ recomienda contactar a ${lead.empresa}${fecha}, confirmar objeción principal, registrar siguiente paso y mover la oportunidad desde ${lead.etapa} para reducir riesgo comercial.`;
      }

      if (lead.etapa === "Propuesta" || lead.etapa === "Negociación") {
        return `BNS™ recomienda dar seguimiento ejecutivo a ${lead.empresa}${fecha}, validar decisores, monto y fecha probable de cierre para proteger el forecast.`;
      }

      return `BNS™ recomienda mantener seguimiento estructurado con ${lead.empresa}${fecha}, documentar avance y evitar enfriamiento del pipeline.`;
    }

    if (accion.prioridad === "Alta" && accion.impacto === "Alto") {
      return `BNS™ recomienda ejecutar esta acción${fecha}, asignar responsable directo y revisarla en comité operativo porque combina prioridad alta e impacto alto.`;
    }

    if (titulo.includes("lead") || titulo.includes("cliente") || titulo.includes("venta") || titulo.includes("comercial")) {
      return `BNS™ recomienda convertir esta acción en una rutina comercial medible: responsable, fecha, siguiente contacto y evidencia de avance para mejorar conversión.`;
    }

    if (titulo.includes("soporte") || titulo.includes("ticket") || titulo.includes("atención") || titulo.includes("atencion")) {
      return `BNS™ recomienda reducir tiempos de respuesta, clasificar casos críticos y documentar causa raíz para bajar presión operativa y reputacional.`;
    }

    if (titulo.includes("reporte") || titulo.includes("pdf") || titulo.includes("dashboard") || titulo.includes("métrica") || titulo.includes("metrica")) {
      return `BNS™ recomienda estandarizar la información, validar datos fuente y actualizar métricas ejecutivas para mejorar visibilidad directiva.`;
    }

    return `BNS™ recomienda cerrar esta acción${fecha}, documentar resultado, responsable y evidencia para reducir fricción operativa y fortalecer trazabilidad ejecutiva.`;
  }

  async function agregarAccionEjecutiva() {
    if (nuevaAccion.titulo.trim() === "" || nuevaAccion.responsable.trim() === "") {
      alert("Agrega al menos título y responsable de la acción.");
      return;
    }

    const accionBase: AccionEjecutiva = {
      ...nuevaAccion,
      id: `${Date.now()}`,
      fechaCompromiso: nuevaAccion.fechaCompromiso || "Sin fecha",
    };

    const accion: AccionEjecutiva = {
      ...accionBase,
      recomendacionBNS: generarRecomendacionBNSAccion(accionBase),
    };

    setAccionesEjecutivas((actual) => [accion, ...actual]);
    await guardarAccionSupabase(accion);
    setNuevaAccion({
      ...accionVacia,
      responsable: usuario.nombre || "Dirección General",
    });
    setTabActiva("acciones");
  }

  function cambiarEstadoAccion(id: string, estado: EstadoAccion) {
    setAccionesEjecutivas((actual) =>
      actual.map((accion) => (accion.id === id ? { ...accion, estado } : accion))
    );
  }

  function eliminarAccionEjecutiva(id: string) {
    setAccionesEjecutivas((actual) => actual.filter((accion) => accion.id !== id));
  }


  function normalizarTexto(valor: string) {
    return valor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function obtenerValorFila(fila: Record<string, string>, posiblesColumnas: string[]) {
    const entradas = Object.entries(fila);
    for (const columna of posiblesColumnas) {
      const columnaNormalizada = normalizarTexto(columna);
      const encontrada = entradas.find(([key]) => normalizarTexto(key) === columnaNormalizada);
      if (encontrada) return encontrada[1]?.trim() || "";
    }
    return "";
  }

  function normalizarEtapa(valor: string): EtapaLead {
    const texto = normalizarTexto(valor);
    if (texto.includes("ganad") || texto.includes("cerrad")) return "Ganado";
    if (texto.includes("perdid") || texto.includes("rechaz")) return "Perdido";
    if (texto.includes("negoci")) return "Negociación";
    if (texto.includes("propu") || texto.includes("cotiza")) return "Propuesta";
    if (texto.includes("contact")) return "Contactado";
    return "Nuevo";
  }

  function normalizarTemperatura(valor: string): TemperaturaLead {
    const texto = normalizarTexto(valor);
    if (texto.includes("cal") || texto.includes("hot") || texto.includes("alto")) return "Caliente";
    if (texto.includes("fri") || texto.includes("cold") || texto.includes("bajo")) return "Frío";
    return "Tibio";
  }

  function normalizarRiesgo(valor: string): RiesgoLead {
    const texto = normalizarTexto(valor);
    if (texto.includes("alto") || texto.includes("high") || texto.includes("rojo")) return "Alto";
    if (texto.includes("bajo") || texto.includes("low") || texto.includes("verde")) return "Bajo";
    return "Medio";
  }

  function parseCSV(texto: string) {
    const filas: string[][] = [];
    let celda = "";
    let fila: string[] = [];
    let dentroComillas = false;

    for (let i = 0; i < texto.length; i += 1) {
      const char = texto[i];
      const siguiente = texto[i + 1];

      if (char === '"' && dentroComillas && siguiente === '"') {
        celda += '"';
        i += 1;
        continue;
      }

      if (char === '"') {
        dentroComillas = !dentroComillas;
        continue;
      }

      if ((char === "," || char === "\t" || char === ";") && !dentroComillas) {
        fila.push(celda.trim());
        celda = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !dentroComillas) {
        if (char === "\r" && siguiente === "\n") i += 1;
        fila.push(celda.trim());
        if (fila.some((item) => item !== "")) filas.push(fila);
        fila = [];
        celda = "";
        continue;
      }

      celda += char;
    }

    fila.push(celda.trim());
    if (fila.some((item) => item !== "")) filas.push(fila);

    if (filas.length < 2) return [];

    const encabezados = filas[0].map((item) => item.trim());
    return filas.slice(1).map((valores) =>
      encabezados.reduce<Record<string, string>>((objeto, encabezado, index) => {
        objeto[encabezado] = valores[index] || "";
        return objeto;
      }, {})
    );
  }

  function transformarFilasAImportacion(filas: Record<string, string>[]) {
    return filas
      .map((fila) => {
        const cliente = obtenerValorFila(fila, ["cliente", "empresa", "compañía", "company", "cuenta", "account"]);
        const contacto = obtenerValorFila(fila, ["contacto", "nombre", "lead", "prospecto", "cliente principal", "contact"]);
        const monto = obtenerValorFila(fila, ["monto", "valor", "importe", "venta", "pipeline", "oportunidad", "amount", "value"]);

        return {
          cliente,
          contacto,
          email: obtenerValorFila(fila, ["email", "correo", "correo electrónico", "mail"]),
          telefono: obtenerValorFila(fila, ["telefono", "teléfono", "celular", "whatsapp", "phone"]),
          monto: monto || "0",
          etapa: normalizarEtapa(obtenerValorFila(fila, ["etapa", "fase", "estado", "stage", "status"])),
          temperatura: normalizarTemperatura(obtenerValorFila(fila, ["temperatura", "prioridad", "interes", "interés", "temperature"])),
          riesgo: normalizarRiesgo(obtenerValorFila(fila, ["riesgo", "risk", "alerta", "semaforo", "semáforo"])),
          responsable: obtenerValorFila(fila, ["responsable", "owner", "asesor", "ejecutivo", "vendedor"]),
          proximaAccion: obtenerValorFila(fila, ["proxima accion", "próxima acción", "siguiente paso", "next step", "accion"]),
          notas: obtenerValorFila(fila, ["notas", "observaciones", "comentarios", "notes"]),
        } satisfies FilaImportada;
      })
      .filter((fila) => fila.cliente.trim() !== "" || fila.contacto.trim() !== "");
  }

  async function cargarArchivoImportacion(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    setArchivoImportado(archivo.name);
    setMensajeImportacion("Leyendo archivo...");

    const extension = archivo.name.split(".").pop()?.toLowerCase();

    if (extension === "xlsx" || extension === "xls") {
      setMensajeImportacion(
        "Archivo Excel detectado. En esta versión local, guarda tu Excel como CSV UTF-8 y súbelo aquí. La conexión XLSX directa se activará con SheetJS/Supabase."
      );
      setFilasImportadas([]);
      return;
    }

    const texto = await archivo.text();
    const filas = parseCSV(texto);
    const normalizadas = transformarFilasAImportacion(filas);

    setFilasImportadas(normalizadas);
    setMensajeImportacion(
      normalizadas.length > 0
        ? `${normalizadas.length} registros listos para importar al pipeline BNS™.`
        : "No pude detectar registros útiles. Revisa que el archivo tenga encabezados como Cliente, Contacto, Monto, Etapa o Responsable."
    );
  }

  async function guardarCSVEnSupabase(
    nuevosLeads: Lead[],
    ejecutivosDesdeCSV: EjecutivoBNS[],
    accionesDesdeCSV: AccionEjecutiva[]
  ) {
    const empresaId = empresaSupabaseId || (await guardarEmpresaSupabase());

    if (!empresaId) {
      setMensajeSupabase("CSV conectado localmente. Falta empresa activa para sincronizar con Supabase.");
      return {
        ok: false,
        mensaje: "Sin empresa activa en Supabase",
      };
    }

    try {
      setSincronizandoSupabase(true);

      const liderDefault = empresa.responsable || usuario.nombre || "Dirección General";

      const leadsPayload = nuevosLeads.map((lead) => {
        const montoLimpio = Number(String(lead.monto || "0").replace(/[^0-9.]/g, ""));

        return {
          empresa_id: empresaId,
          cliente: lead.empresa,
          contacto: lead.contacto,
          monto: Number.isFinite(montoLimpio) ? montoLimpio : 0,
          etapa: lead.etapa,
          temperatura: lead.temperatura,
          responsable:
            lead.notas.match(/Responsable original: ([^•]+)/)?.[1]?.trim() ||
            usuario.nombre ||
            "Sin asignar",
          lider: liderDefault,
          riesgo: lead.riesgo,
          proxima_accion: lead.proximaAccion,
        };
      });

      const ejecutivosPayload = ejecutivosDesdeCSV.map((ejecutivo) => ({
        empresa_id: empresaId,
        nombre: ejecutivo.nombre,
        lider: ejecutivo.lider || liderDefault,
        area: ejecutivo.area,
        cargo: ejecutivo.cargo || "Responsable comercial importado",
        costo_mensual: 0,
      }));

      const accionesPayload = accionesDesdeCSV.map((accion) => ({
        empresa_id: empresaId,
        titulo: accion.titulo,
        area: "Comercial",
        responsable: accion.responsable,
        lider: liderDefault,
        prioridad: accion.prioridad,
        estado: accion.estado,
        fecha:
          accion.fechaCompromiso && accion.fechaCompromiso !== "Sin fecha"
            ? accion.fechaCompromiso
            : null,
        impacto: accion.impacto,
        recomendacion: accion.recomendacionBNS,
      }));

      const [leadsResult, ejecutivosResult, accionesResult] = await Promise.all([
        leadsPayload.length > 0
          ? supabase.from("leads").insert(leadsPayload)
          : Promise.resolve({ error: null }),
        ejecutivosPayload.length > 0
          ? supabase.from("ejecutivos").insert(ejecutivosPayload)
          : Promise.resolve({ error: null }),
        accionesPayload.length > 0
          ? supabase.from("acciones").insert(accionesPayload)
          : Promise.resolve({ error: null }),
      ]);

      if (leadsResult.error) throw leadsResult.error;
      if (ejecutivosResult.error) throw ejecutivosResult.error;
      if (accionesResult.error) throw accionesResult.error;

      setSupabaseConectado(true);
      setMensajeSupabase(
        `CSV sincronizado en Supabase: ${leadsPayload.length} leads, ${ejecutivosPayload.length} responsables y ${accionesPayload.length} acciones.`
      );

      registrarAuditoria(
        "Datos",
        "CSV sincronizado en Supabase",
        `${leadsPayload.length} leads, ${ejecutivosPayload.length} responsables y ${accionesPayload.length} intervenciones fueron guardadas en Supabase.`,
        "Alta"
      );

      return {
        ok: true,
        mensaje: "CSV sincronizado con Supabase",
      };
    } catch (error) {
      console.error("BNS Supabase bulk CSV error:", error);
      setMensajeSupabase(
        "CSV conectado localmente, pero Supabase no aceptó la sincronización masiva. Revisa tablas, columnas o RLS."
      );

      registrarAuditoria(
        "Datos",
        "CSV no sincronizado en Supabase",
        "El CSV se conectó localmente, pero falló la escritura masiva en Supabase.",
        "Alta"
      );

      return {
        ok: false,
        mensaje: "Error al sincronizar CSV en Supabase",
      };
    } finally {
      setSincronizandoSupabase(false);
    }
  }

  async function importarFilasAlPipeline() {
    if (filasImportadas.length === 0) {
      mostrarToastBNS("info", "CSV requerido", "Primero carga un CSV con registros válidos.");
      return;
    }

    const timestamp = Date.now();

    const nuevosLeads: Lead[] = filasImportadas.map((fila, index) => ({
      id: `csv-${timestamp}-${index}`,
      empresa: fila.cliente || fila.contacto || "Lead importado",
      contacto: fila.contacto || fila.cliente || "Contacto pendiente",
      email: fila.email,
      telefono: fila.telefono,
      monto: fila.monto || "0",
      etapa: fila.etapa,
      temperatura: fila.temperatura,
      riesgo: fila.riesgo,
      proximaAccion: fila.proximaAccion || "Dar seguimiento al registro importado",
      notas: [
        fila.notas,
        fila.responsable ? `Responsable original: ${fila.responsable}` : "",
        `Origen: ${archivoImportado || "CSV importado"}`,
      ]
        .filter(Boolean)
        .join(" • "),
    }));

    const responsables = Array.from(
      new Set(filasImportadas.map((fila) => fila.responsable || "Sin asignar").filter(Boolean))
    );

    const montoResponsable = (responsable: string) =>
      filasImportadas
        .filter((fila) => (fila.responsable || "Sin asignar") === responsable)
        .reduce((sum, fila) => {
          const parsed = Number(String(fila.monto || "0").replace(/[^0-9.]/g, ""));
          return sum + (Number.isFinite(parsed) ? parsed : 0);
        }, 0);

    const ejecutivosDesdeCSV: EjecutivoBNS[] = responsables.map((responsable, index) => {
      const filasDelResponsable = filasImportadas.filter(
        (fila) => (fila.responsable || "Sin asignar") === responsable
      );

      const riesgoAlto = filasDelResponsable.filter((fila) => fila.riesgo === "Alto").length;
      const calientes = filasDelResponsable.filter((fila) => fila.temperatura === "Caliente").length;
      const ganados = filasDelResponsable.filter((fila) => fila.etapa === "Ganado").length;
      const conversion = filasDelResponsable.length > 0 ? Math.round((ganados / filasDelResponsable.length) * 100) : 0;

      return {
        id: `csv-exec-${timestamp}-${index}`,
        nombre: responsable,
        lider: usuario.nombre || empresa.responsable || "Dirección General",
        area: "Comercial",
        cargo: "Responsable comercial importado",
        pipeline: String(montoResponsable(responsable)),
        revenue: String(montoResponsable(responsable) * (conversion / 100)),
        conversion: String(conversion),
        velocidad: calientes >= riesgoAlto ? "Alta" : "Media",
        riesgo: riesgoAlto > filasDelResponsable.length * 0.25 ? "Alto" : "Medio",
        estado:
          riesgoAlto > filasDelResponsable.length * 0.35
            ? "En riesgo"
            : calientes > filasDelResponsable.length * 0.25
            ? "Ganando"
            : "Estable",
        dependencia: filasDelResponsable.length > Math.max(8, filasImportadas.length / 3) ? "Alta" : "Media",
      };
    });

    const accionesDesdeCSV: AccionEjecutiva[] = filasImportadas
      .filter((fila) => fila.riesgo === "Alto" || fila.temperatura === "Frío" || fila.proximaAccion.trim() !== "")
      .slice(0, 25)
      .map((fila, index) => ({
        id: `csv-action-${timestamp}-${index}`,
        titulo: fila.proximaAccion || `Seguimiento crítico a ${fila.cliente || fila.contacto}`,
        responsable: fila.responsable || usuario.nombre || "Dirección General",
        prioridad: fila.riesgo === "Alto" ? "Alta" : fila.temperatura === "Frío" ? "Media" : "Media",
        estado: "Pendiente",
        fechaCompromiso: new Date(Date.now() + (index + 1) * 86400000).toISOString().slice(0, 10),
        leadRelacionado: fila.cliente || fila.contacto || "Lead importado",
        impacto: fila.riesgo === "Alto" ? "Alto" : "Medio",
        recomendacionBNS:
          fila.riesgo === "Alto"
            ? "Intervención ejecutiva para proteger forecast y evitar pérdida de oportunidad."
            : "Asegurar siguiente paso y actualizar estado comercial.",
        notas: `Generada automáticamente desde ${archivoImportado || "CSV"}`,
      }));

    setLeads((actual) => [...nuevosLeads, ...actual]);

    setEjecutivos((actual) => {
      const nombresActuales = new Set(actual.map((ejecutivo) => ejecutivo.nombre.toLowerCase()));
      const nuevos = ejecutivosDesdeCSV.filter(
        (ejecutivo) => !nombresActuales.has(ejecutivo.nombre.toLowerCase())
      );
      return [...nuevos, ...actual];
    });

    setAccionesEjecutivas((actual) => [...accionesDesdeCSV, ...actual]);

    const resultadoSupabaseCSV = await guardarCSVEnSupabase(
      nuevosLeads,
      ejecutivosDesdeCSV,
      accionesDesdeCSV
    );

    setMensajeImportacion(
      resultadoSupabaseCSV.ok
        ? `${nuevosLeads.length} registros conectados al ecosistema y sincronizados en Supabase.`
        : `${nuevosLeads.length} registros conectados localmente. Supabase pendiente: ${resultadoSupabaseCSV.mensaje}.`
    );

    registrarAuditoria(
      "Datos",
      "CSV conectado al ecosistema",
      `${nuevosLeads.length} leads, ${ejecutivosDesdeCSV.length} responsables y ${accionesDesdeCSV.length} intervenciones fueron generadas desde ${archivoImportado || "CSV"}.`,
      "Alta"
    );

    registrarEventoVivo(
      "Data",
      "CSV conectado al ecosistema",
      `${nuevosLeads.length} señales, ${ejecutivosDesdeCSV.length} responsables y ${accionesDesdeCSV.length} intervenciones fueron generadas.`,
      "Alta"
    );

    mostrarToastBNS(
      "ok",
      "CSV conectado al ecosistema",
      `${nuevosLeads.length} señales, ${ejecutivosDesdeCSV.length} responsables y ${accionesDesdeCSV.length} intervenciones fueron generadas.`
    );

    setTabActiva("boardroom");
  }

  function limpiarImportador() {
    setArchivoImportado("");
    setFilasImportadas([]);
    setMensajeImportacion("");
  }



  function safeNumber(value: unknown, fallback = 0) {
    const parsed =
      typeof value === "number"
        ? value
        : Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function safePercent(value: unknown, fallback = 0) {
    const parsed = safeNumber(value, fallback);
    return Math.max(0, Math.min(100, Math.round(parsed)));
  }

  function formatoMoneda(valor: number) {
    const safeValue = safeNumber(valor);
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(safeValue);
  }

  async function analizarSitio() {
    const urlFinal = url.trim() || empresa.sitio.trim();

    if (urlFinal === "") {
      alert("Por favor ingresa una URL para analizar.");
      return;
    }

    setUrl(urlFinal);
    setAnalizado(false);
    setAnalizando(true);

    setMensajeAnalisis("Inicializando análisis neuronal...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMensajeAnalisis("Escaneando arquitectura empresarial...");
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setMensajeAnalisis("Interpretando señales operativas...");
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setMensajeAnalisis("Analizando ingresos, soporte y conversión...");
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setMensajeAnalisis("Generando diagnóstico ejecutivo...");
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setAnalizando(false);
    setAnalizado(true);
  }

  function descargarPDF() {
    registrarAuditoria(
      "PDF",
      "Reporte ejecutivo generado",
      "Se generó el Enterprise Health Report™ V6 con PDF Polish aplicado.",
      "Media"
    );

    const doc = new jsPDF("p", "mm", "a4");

    const W = 210;
    const H = 297;

    type RGB = [number, number, number];

    const colors = {
      bg: [2, 6, 23] as RGB,
      bg2: [5, 8, 17] as RGB,
      panel: [7, 17, 31] as RGB,
      panel2: [10, 22, 38] as RGB,
      cyan: [34, 211, 238] as RGB,
      cyanSoft: [103, 232, 249] as RGB,
      gold: [250, 204, 21] as RGB,
      red: [251, 113, 133] as RGB,
      green: [52, 211, 153] as RGB,
      purple: [168, 85, 247] as RGB,
      white: [255, 255, 255] as RGB,
      text: [226, 232, 240] as RGB,
      muted: [148, 163, 184] as RGB,
      dim: [71, 85, 105] as RGB,
      stroke: [21, 94, 117] as RGB,
    };

    const setRGB = (type: "fill" | "text" | "draw", rgb: RGB) => {
      if (type === "fill") doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      if (type === "text") doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      if (type === "draw") doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    };

    const executiveClean = (value: unknown, fallback = "Operational") => {
      const v = String(value ?? "").trim();
      if (!v || v === "undefined" || v === "null" || v === "NaN") return fallback;
      return v;
    };

    const safeSignalCount = Array.isArray(signalEventEngine) ? signalEventEngine.length : 0;
    const safeAreaScores = Array.isArray(bnsMetrics.areaScores) ? bnsMetrics.areaScores : [];
    const safeTrendRows = Array.isArray(bnsMetrics.trends) ? bnsMetrics.trends : [];

    const intelligenceFallbacks = [
      "Healthy cadence",
      "Signal intake stable",
      "External feeds pending",
      "Cross-system sync pending",
      "Forecast sync active",
      "Operational feed warming",
    ];

    const normalizedAreaScores = safeAreaScores.map((area, index) => {
      const rawScore = safePercent(area.score);
      const fallbackLabel = intelligenceFallbacks[index % intelligenceFallbacks.length];
      return {
        ...area,
        score: rawScore === 0 ? 18 + index * 4 : rawScore,
        displayScore: rawScore === 0 ? fallbackLabel : `${rawScore}%`,
        status: rawScore === 0 ? fallbackLabel : executiveClean(area.status, "Operational"),
      };
    });

    const areaScoresPDF =
      normalizedAreaScores.length > 0
        ? normalizedAreaScores
        : [
            { label: "Operación", score: 80, displayScore: "80%", status: "Fuerte", colorName: "green" },
            { label: "Comercial", score: 72, displayScore: "72%", status: "Presión", colorName: "yellow" },
            { label: "Digital", score: 64, displayScore: "64%", status: "Pendiente", colorName: "cyan" },
            { label: "Liderazgo", score: 72, displayScore: "72%", status: "Dependencia", colorName: "purple" },
            { label: "Soporte", score: 58, displayScore: "58%", status: "Atención", colorName: "red" },
            { label: "Procesos", score: 78, displayScore: "78%", status: "Estable", colorName: "green" },
          ];

    const trendRowsPDF =
      safeTrendRows.length > 0
        ? safeTrendRows
        : [
            { area: "Operación", trend: "UP", value: "+8%", note: "Continuidad funcional" },
            { area: "Comercial", trend: "PRESSURE", value: "-5%", note: "Seguimiento irregular" },
            { area: "Digital", trend: "STABLE", value: "+4%", note: "Potencial de conversión" },
            { area: "Soporte", trend: "PRESSURE", value: "-9%", note: "Tiempos de respuesta" },
            { area: "Liderazgo", trend: "STABLE", value: "0%", note: "Decisión ejecutiva" },
          ];

    const empresaPDF = executiveClean(nombreEmpresa, "Empresa sin registrar");
    const giroPDF = executiveClean(empresa.giro, "No registrado");
    const sitioPDF = executiveClean(url || empresa.sitio, "No registrado");
    const responsablePDF = executiveClean(empresa.responsable || usuario.nombre, "No registrado");
    const objetivoPDF = executiveClean(
      empresa.objetivo,
      "Ordenar operación, fortalecer seguimiento comercial y acelerar decisiones ejecutivas."
    );

    const revenueFallback = Math.max(safeNumber(forecastIntelligence.metaEstimacion) * 0.42, 1250000);
    const conservativeRevenue = safeNumber(forecastIntelligence.conservador) > 0 ? safeNumber(forecastIntelligence.conservador) : revenueFallback;
    const probableRevenue = safeNumber(forecastIntelligence.probable) > 0 ? safeNumber(forecastIntelligence.probable) : revenueFallback * 1.35;
    const aggressiveRevenue = safeNumber(forecastIntelligence.agresivo) > 0 ? safeNumber(forecastIntelligence.agresivo) : revenueFallback * 1.9;

    const pageBg = () => {
      setRGB("fill", colors.bg);
      doc.rect(0, 0, W, H, "F");

      setRGB("fill", [3, 18, 34]);
      doc.circle(188, 20, 42, "F");
      setRGB("fill", [7, 25, 48]);
      doc.circle(18, 274, 58, "F");

      setRGB("draw", [8, 47, 73]);
      doc.setLineWidth(0.16);
      for (let x = 16; x < 200; x += 18) doc.line(x, 38, x, 268);
      for (let y = 42; y < 270; y += 18) doc.line(14, y, 196, y);
    };

    const brandMark = (x: number, y: number, size = 14) => {
      setRGB("draw", colors.cyan);
      doc.setLineWidth(0.45);
      doc.roundedRect(x, y, size, size, 4, 4, "S");
      setRGB("draw", [16, 185, 210]);
      doc.circle(x + size / 2, y + size / 2, size * 0.28, "S");
      setRGB("fill", colors.cyanSoft);
      doc.circle(x + size / 2, y + size / 2, size * 0.09, "F");
      setRGB("draw", [30, 64, 90]);
      doc.line(x + size * 0.12, y + size * 0.72, x + size * 0.36, y + size * 0.52);
      doc.line(x + size * 0.64, y + size * 0.48, x + size * 0.88, y + size * 0.28);
    };

    const header = (title: string, page: number) => {
      pageBg();
      brandMark(16, 14, 12);
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("BNS", 32, 22);
      setRGB("text", colors.cyan);
      doc.setFontSize(6);
      doc.text("TM", 47, 17.5);

      setRGB("text", colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("BUSINESS NERVOUS SYSTEM", 32, 28);

      setRGB("text", colors.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(title, 108, 22, { align: "center" });

      setRGB("text", colors.dim);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(empresaPDF, 194, 22, { align: "right" });

      setRGB("draw", [15, 53, 75]);
      doc.line(16, 34, 194, 34);

      setRGB("text", colors.dim);
      doc.setFontSize(7);
      doc.text(`BNS Enterprise Report V6 - ${fechaActual}`, 16, 284);
      doc.text(`Built by Alex Resendiz`, 132, 284, { align: "center" });
      doc.text(String(page), 194, 284, { align: "right" });
    };

    const panel = (x: number, y: number, w: number, h: number, tone: RGB = colors.cyan) => {
      setRGB("fill", colors.panel);
      doc.roundedRect(x, y, w, h, 5, 5, "F");
      setRGB("draw", [16, 78, 104]);
      doc.setLineWidth(0.35);
      doc.roundedRect(x, y, w, h, 5, 5, "S");
      setRGB("fill", [3, 35, 52]);
      doc.roundedRect(x + 1, y + 1, w - 2, 7, 4, 4, "F");
      setRGB("draw", tone);
      doc.setLineWidth(0.6);
      doc.line(x + 5, y + 1.2, x + 28, y + 1.2);
    };

    const label = (txt: string, x: number, y: number, rgb: RGB = colors.cyan) => {
      setRGB("text", rgb);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.2);
      doc.text(executiveClean(txt).toUpperCase(), x, y);
    };

    const wrapped = (txt: string, x: number, y: number, width: number, lineHeight = 5, size = 9) => {
      setRGB("text", colors.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(executiveClean(txt), width);
      doc.text(lines, x, y);
      return y + lines.length * lineHeight;
    };

    const kpi = (x: number, y: number, w: number, title: string, value: string, tone: RGB, sub?: string) => {
      panel(x, y, w, 31, tone);
      label(title, x + 6, y + 9, tone);
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(value.length > 10 ? 12 : 17);
      doc.text(executiveClean(value), x + 6, y + 21);
      if (sub) {
        setRGB("text", colors.muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(executiveClean(sub), x + 6, y + 27);
      }
    };

    const section = (title: string, x: number, y: number, tone: RGB = colors.cyan) => {
      label(title, x, y, tone);
      setRGB("draw", tone);
      doc.setLineWidth(0.7);
      doc.line(x, y + 3, x + 22, y + 3);
    };

    const bullet = (title: string, body: string, x: number, y: number, w: number, tone: RGB) => {
      setRGB("fill", [5, 13, 26]);
      doc.roundedRect(x, y, w, 20, 4, 4, "F");
      setRGB("draw", [18, 55, 74]);
      doc.roundedRect(x, y, w, 20, 4, 4, "S");
      setRGB("fill", tone);
      doc.circle(x + 5, y + 6.5, 1.3, "F");
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(executiveClean(title), x + 9, y + 7.5);
      setRGB("text", colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.text(doc.splitTextToSize(executiveClean(body), w - 14), x + 9, y + 13);
    };

    const progress = (x: number, y: number, w: number, value: number, tone: RGB, title: string, status: string, display?: string) => {
      setRGB("text", colors.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(executiveClean(title), x, y);
      setRGB("fill", [15, 23, 42]);
      doc.roundedRect(x + 42, y - 4, w, 4, 2, 2, "F");
      setRGB("fill", tone);
      doc.roundedRect(x + 42, y - 4, Math.max(2, (w * safePercent(value)) / 100), 4, 2, 2, "F");
      if (display) {
        setRGB("text", colors.muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(display, x + 42 + w + 8, y);
      }

      if (status) {
        setRGB("text", tone);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(executiveClean(status), x + 42 + w + 30, y);
      }
    };

    // 1. COVER
    pageBg();
    brandMark(18, 20, 18);
    setRGB("text", colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("BNS", 42, 31);
    setRGB("text", colors.cyan);
    doc.setFontSize(7);
    doc.text("TM", 62, 24);
    setRGB("text", colors.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("BUSINESS NERVOUS SYSTEM", 42, 39);

    setRGB("text", colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text("Enterprise", 18, 78);
    doc.text("Health Report", 18, 94);

    setRGB("text", colors.cyan);
    doc.setFontSize(8);
    doc.text("EXECUTIVE INTELLIGENCE DOCUMENT", 18, 108);

    setRGB("text", colors.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Business Nervous System - Strategic Enterprise Diagnosis", 18, 118);

    panel(18, 140, 174, 48, colors.cyan);
    label("Empresa analizada", 26, 153, colors.cyan);
    setRGB("text", colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(empresaPDF, 26, 165);
    setRGB("text", colors.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Giro: ${giroPDF}`, 26, 175);
    doc.text(`Sitio: ${sitioPDF}`, 26, 182);

    kpi(18, 202, 42, "BNS Index", `${safeNumber(bnsMetrics.bnsScore)}/100`, colors.cyan, "Enterprise health");
    kpi(66, 202, 42, "Pressure", `${safePercent(pressureEngine.promedio)}%`, colors.gold, pressureEngine.estadoGeneral);
    kpi(114, 202, 42, "Forecast", `${safePercent(forecastIntelligence.confianza)}%`, colors.green, forecastIntelligence.riesgoCumplimiento);
    kpi(162, 202, 30, "Signals", safeSignalCount > 0 ? `${safeSignalCount}` : "0", colors.purple, safeSignalCount > 0 ? "Live feed" : "Standing by");

    setRGB("text", colors.muted);
    doc.setFontSize(8);
    doc.text(`Responsable: ${responsablePDF}`, 18, 255);
    doc.text(`Fecha del sistema: ${fechaActual}`, 18, 263);
    setRGB("text", colors.cyan);
    doc.setFont("helvetica", "bold");
    doc.text("Powered by BNS Intelligence Layer - Built by Alex Resendiz", 18, 274);

    // 2. EXECUTIVE SUMMARY
    doc.addPage();
    header("Executive Business Diagnosis", 2);
    section("1. Resumen ejecutivo", 18, 52);
    panel(18, 60, 174, 60, colors.cyan);
    wrapped(
      `La organización ${empresaPDF} presenta un BNS Index de ${safeNumber(bnsMetrics.bnsScore)}/100. La operación se mantiene activa, pero BNS identifica puntos de vigilancia en forecast, seguimiento comercial, automatización y trazabilidad ejecutiva. Objetivo declarado: ${objetivoPDF}.`,
      26,
      76,
      158,
      5,
      9
    );

    kpi(18, 133, 40, "BNS Index", `${safeNumber(bnsMetrics.bnsScore)}/100`, colors.cyan);
    kpi(62, 133, 40, "Riesgo", `${safePercent(bnsMetrics.riesgoScore)}%`, colors.red);
    kpi(106, 133, 40, "Presión", pressureEngine.estadoGeneral, colors.gold);
    kpi(150, 133, 42, "Operación", "Activa", colors.green);

    const executiveHighlights = [
      {
        title: "Forecast Integrity",
        value: executiveClean(forecastIntelligence.riesgoCumplimiento, "Vigilancia"),
        tone: forecastIntelligence.riesgoCumplimiento === "Alto" ? colors.red : colors.gold,
      },
      {
        title: "Operational Status",
        value: executiveClean(pressureEngine.estadoGeneral, "Operativo"),
        tone: colors.cyan,
      },
      {
        title: "AI Executive Layer",
        value: groqGenerando ? "Analizando" : "Operativa",
        tone: colors.purple,
      },
    ];

    let hx = 18;
    executiveHighlights.forEach((highlight) => {
      panel(hx, 172, 54, 26, highlight.tone);
      label(highlight.title, hx + 5, 182, highlight.tone);
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(doc.splitTextToSize(highlight.value, 42), hx + 5, 193);
      hx += 60;
    });

    section("2. Hallazgos principales", 18, 216);
    bullet("Estabilidad operativa", "La operación se mantiene funcional y lista para conectar fuentes reales.", 18, 229, 82, colors.green);
    bullet("Forecast bajo vigilancia", `Confianza ${safePercent(forecastIntelligence.confianza)}% con riesgo ${forecastIntelligence.riesgoCumplimiento}.`, 110, 229, 82, colors.gold);
    bullet("Datos y automatización", "La predicción mejora al conectar WhatsApp, CRM, ERP y fuentes pasivas.", 18, 256, 82, colors.cyan);
    bullet("Decisión ejecutiva", "Priorizar intervención sobre oportunidades, responsables y seguimiento.", 110, 256, 82, colors.purple);

    // 3. ACTION PLAN
    doc.addPage();
    header("Executive Action Plan", 3);
    section("3. Prioridades recomendadas", 18, 52);
    const priorities = [
      ["Alta", "Conectar Supabase Auth", "Usuarios reales, sesiones seguras y control de acceso.", "Alto"],
      ["Alta", "Activar RLS por empresa", "Protección de datos y separación por organización.", "Alto"],
      ["Alta", "Conectar Groq IA", "Diagnóstico inteligente con lectura ejecutiva real.", "Alto"],
      ["Media", "Automatizar seguimiento comercial", "Menos fuga de oportunidades y mayor conversión.", "Alto"],
      ["Media", "Conectar WhatsApp y fuentes digitales", "Señales reales para alertas y atención.", "Medio"],
    ];

    let y = 68;
    priorities.forEach(([priority, action, impact, value]) => {
      const tone = priority === "Alta" ? colors.red : colors.gold;
      panel(18, y, 174, 25, tone);
      label(priority, 26, y + 9, tone);
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.6);
      doc.text(action, 52, y + 9);
      setRGB("text", colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.text(doc.splitTextToSize(impact, 94), 52, y + 16);
      setRGB("text", tone);
      doc.setFont("helvetica", "bold");
      doc.text(value, 184, y + 14, { align: "right" });
      y += 31;
    });

    section("4. Interpretación BNS", 18, 232);
    panel(18, 240, 174, 28, colors.cyan);
    wrapped(
      "Este reporte interpreta los datos disponibles. Conforme se conecten fuentes reales, BNS generará diagnósticos por empresa, usuario, rol, canal y área funcional.",
      26,
      254,
      158,
      5,
      8
    );

    // 4. VISUAL INTELLIGENCE
    doc.addPage();
    header("Visual Intelligence Dashboard", 4);
    section("5. Health Score, radar y barras funcionales", 18, 52);

    panel(18, 66, 78, 72, colors.cyan);
    label("Enterprise Health", 31, 81, colors.cyan);
    setRGB("draw", [15, 23, 42]);
    doc.setLineWidth(8);
    doc.circle(57, 105, 19, "S");
    setRGB("draw", safeNumber(bnsMetrics.bnsScore) >= 80 ? colors.green : colors.gold);
    doc.setLineWidth(8);
    doc.circle(57, 105, 19, "S");
    setRGB("text", colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(25);
    doc.text(`${safeNumber(bnsMetrics.bnsScore)}`, 57, 108, { align: "center" });
    setRGB("text", colors.muted);
    doc.setFontSize(7);
    doc.text("/100", 57, 119, { align: "center" });

    panel(106, 66, 86, 72, colors.purple);
    label("Functional Radar", 121, 81, colors.purple);
    const radarCx = 149;
    const radarCy = 106;
    const radarR = 24;
    const radarData = areaScoresPDF.slice(0, 6);

    setRGB("fill", [18, 20, 55]);
    doc.circle(radarCx, radarCy, 31, "F");
    setRGB("fill", [9, 18, 42]);
    doc.circle(radarCx, radarCy, 25, "F");
    setRGB("draw", [55, 125, 155]);
    doc.setLineWidth(0.35);
    doc.circle(radarCx, radarCy, 31, "S");
    setRGB("draw", [82, 70, 150]);
    doc.circle(radarCx, radarCy, 20, "S");

    setRGB("draw", [25, 45, 72]);
    doc.setLineWidth(0.25);
    for (let r = 8; r <= 28; r += 5) doc.circle(radarCx, radarCy, r, "S");
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = (angle * Math.PI) / 180;
      doc.line(radarCx, radarCy, radarCx + Math.cos(rad) * 28, radarCy + Math.sin(rad) * 28);
    }

    setRGB("draw", [30, 41, 59]);
    doc.setLineWidth(0.4);
    for (let level = 1; level <= 4; level += 1) {
      doc.circle(radarCx, radarCy, (radarR * level) / 4, "S");
    }
    const points = radarData.map((area, index) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / Math.max(radarData.length, 1);
      const r = (radarR * safePercent(area.score)) / 100;
      return [radarCx + Math.cos(angle) * r, radarCy + Math.sin(angle) * r] as [number, number];
    });
    setRGB("draw", colors.cyan);
    doc.setLineWidth(1.2);
    points.forEach((p, index) => {
      const next = points[(index + 1) % points.length];
      doc.line(p[0], p[1], next[0], next[1]);
      setRGB("fill", colors.cyan);
      doc.circle(p[0], p[1], 1.4, "F");
    });

    const radarLabelMap: Record<string, string> = {
      Operación: "OPS",
      Comercial: "REV",
      Digital: "DIG",
      Liderazgo: "LDR",
      Soporte: "SUP",
      Procesos: "PROC",
    };

    setRGB("text", colors.muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(4.8);
    radarData.forEach((area, index) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / Math.max(radarData.length, 1);
      const lx = radarCx + Math.cos(angle) * 33;
      const ly = radarCy + Math.sin(angle) * 33;
      const radarLabel = radarLabelMap[executiveClean(area.label)] || executiveClean(area.label).slice(0, 4).toUpperCase();
      doc.text(radarLabel, lx, ly, { align: "center" });
    });

    section("6. Barras por área funcional", 18, 158);
    y = 176;
    areaScoresPDF.slice(0, 6).forEach((area) => {
      const tone =
        area.colorName === "green"
          ? colors.green
          : area.colorName === "yellow"
            ? colors.gold
            : area.colorName === "red"
              ? colors.red
              : area.colorName === "purple"
                ? colors.purple
                : colors.cyan;
      const areaDisplay = executiveClean(area.displayScore);
      progress(24, y, 88, safePercent(area.score), tone, area.label, "", "");

      setRGB("fill", [8, 20, 36]);
      doc.roundedRect(150, y - 5, 32, 7, 2, 2, "F");
      setRGB("draw", tone);
      doc.setLineWidth(0.25);
      doc.roundedRect(150, y - 5, 32, 7, 2, 2, "S");
      setRGB("text", tone);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(4.7);
      doc.text(areaDisplay.toUpperCase(), 166, y, { align: "center" });

      y += 13;
    });

    panel(18, 258, 174, 16, colors.cyan);
    setRGB("text", colors.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("Lectura visual:", 26, 268);
    setRGB("text", colors.muted);
    doc.setFont("helvetica", "normal");
    doc.text("BNS prioriza trazabilidad, integración de fuentes y lectura ejecutiva antes de escalar automatización.", 58, 268);

    // 5. TRENDS
    doc.addPage();
    header("Trends & Strategic Roadmap", 5);
    section("7. Tendencias ejecutivas", 18, 52);
    y = 68;
    trendRowsPDF.slice(0, 5).forEach((trend) => {
      const tone = trend.trend === "UP" ? colors.green : trend.trend === "PRESSURE" ? colors.red : colors.gold;
      panel(18, y, 174, 24, tone);
      label(trend.area, 26, y + 9, tone);
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(executiveClean(trend.trend), 78, y + 9);
      setRGB("text", tone);
      doc.text(executiveClean(trend.value), 112, y + 9);
      setRGB("text", colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.text(doc.splitTextToSize(executiveClean(trend.note), 54), 132, y + 8);
      y += 30;
    });

    section("8. Roadmap de madurez BNS", 18, 225);
    const roadmap = [
      ["01", "Base digital", "Registro, usuarios y empresa"],
      ["02", "Datos seguros", "Supabase Auth + RLS"],
      ["03", "IA ejecutiva", "Groq + diagnóstico real"],
      ["04", "Automatización", "WhatsApp, alertas y reportes"],
    ];
    roadmap.forEach(([step, title, desc], index) => {
      const x = 18 + index * 44;
      setRGB("fill", index === 0 ? colors.cyan : [15, 23, 42]);
      doc.circle(x + 7, 244, 7, "F");
      setRGB("text", index === 0 ? colors.bg : colors.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(step, x + 7, 246.5, { align: "center" });
      if (index < roadmap.length - 1) {
        setRGB("draw", [30, 64, 90]);
        doc.line(x + 15, 244, x + 41, 244);
      }
      setRGB("text", colors.white);
      doc.setFontSize(8);
      doc.text(title, x, 260);
      setRGB("text", colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text(doc.splitTextToSize(desc, 34), x, 267);
    });

    // 6. EXECUTION
    doc.addPage();
    header("Action Execution Matrix", 6);
    section("9. Acciones ejecutivas BNS", 18, 52);
    kpi(18, 66, 40, "Pendientes", `${bnsMetrics.accionesPendientes}`, colors.cyan);
    kpi(62, 66, 40, "Alta", `${bnsMetrics.accionesAltaPrioridad}`, colors.red);
    kpi(106, 66, 40, "Vencidas", `${bnsMetrics.accionesVencidas}`, colors.gold);
    kpi(150, 66, 42, "Cumplimiento", `${bnsMetrics.cumplimientoAcciones}%`, colors.green);

    const accionesPDF = accionesEjecutivas.length > 0
      ? accionesEjecutivas.slice(0, 5)
      : [
          {
            titulo: "Definir responsables por área",
            responsable: responsablePDF,
            prioridad: "Alta",
            estado: "Pendiente",
            fechaCompromiso: "Sin fecha",
            impacto: "Alto",
          },
          {
            titulo: "Estandarizar seguimiento comercial",
            responsable: "Comercial",
            prioridad: "Media",
            estado: "Pendiente",
            fechaCompromiso: "Sin fecha",
            impacto: "Alto",
          },
        ];

    y = 118;
    accionesPDF.forEach((accion) => {
      const priority = executiveClean(accion.prioridad, "Media");
      const tone = priority === "Alta" ? colors.red : priority === "Media" ? colors.gold : colors.green;
      panel(18, y, 174, 26, tone);
      label(priority, 26, y + 9, tone);
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      doc.text(doc.splitTextToSize(executiveClean(accion.titulo), 62), 52, y + 9);
      setRGB("text", colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(`Resp: ${executiveClean(accion.responsable)}`, 118, y + 9);
      doc.text(`Estado: ${executiveClean(accion.estado)}`, 118, y + 16);
      doc.text(`Impacto: ${executiveClean(accion.impacto)}`, 160, y + 9);
      doc.text(`Fecha: ${executiveClean(accion.fechaCompromiso)}`, 160, y + 16);
      y += 32;
    });

    // 7. FORECAST
    doc.addPage();
    header("Revenue Forecast Intelligence", 7);
    section("10. Escenarios de forecast", 18, 52);
    kpi(18, 68, 54, "Conservador", formatoMoneda(conservativeRevenue), colors.gold);
    kpi(78, 68, 54, "Probable", formatoMoneda(probableRevenue), colors.cyan);
    kpi(138, 68, 54, "Agresivo", formatoMoneda(aggressiveRevenue), colors.green);

    panel(18, 122, 174, 54, colors.purple);
    section("11. Lectura CFO / Dirección", 26, 139, colors.purple);
    wrapped(
      `BNS estima confianza de forecast de ${safePercent(forecastIntelligence.confianza)}% con riesgo de cumplimiento ${forecastIntelligence.riesgoCumplimiento}. Meta estimada: ${formatoMoneda(forecastIntelligence.metaEstimacion)}. Desviación vs meta: ${forecastIntelligence.desviacionVsMeta}%.`,
      26,
      154,
      158,
      5,
      8
    );

    panel(18, 195, 174, 42, colors.gold);
    wrapped(forecastIntelligence.lectura, 26, 212, 158, 5, 9);

    // 8. PRESSURE
    doc.addPage();
    header("Organizational Pressure Intelligence", 8);
    section("12. Presión organizacional", 18, 52);
    kpi(18, 68, 54, "Promedio", `${safePercent(pressureEngine.promedio)}%`, colors.red);
    kpi(78, 68, 54, "Estado", pressureEngine.estadoGeneral, colors.gold);
    kpi(138, 68, 54, "BNS Index", `${safeNumber(bnsMetrics.bnsScore)}/100`, colors.cyan);

    panel(18, 122, 174, 44, colors.cyan);
    wrapped(pressureEngine.señalPrincipal, 26, 140, 158, 5, 9);

    y = 184;
    pressureEngine.items.slice(0, 4).forEach((item) => {
      const tone = item.estado === "Saturación" ? colors.red : item.estado === "Presión" ? colors.gold : colors.green;
      panel(18, y, 174, 21, tone);
      label(item.estado, 26, y + 8.5, tone);
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`${executiveClean(item.nombre)} (${executiveClean(item.tipo)})`, 68, y + 8.5);
      setRGB("text", tone);
      doc.text(`${safePercent(item.score)}%`, 184, y + 8.5, { align: "right" });
      y += 27;
    });

    doc.save(`BNS_Enterprise_Health_Report_V6_${empresaPDF.replace(/\s+/g, "_")}.pdf`);
  }

  function descargarPDFIA() {
    try {
      registrarAuditoria(
        "PDF",
        "Briefing IA generado",
        "Se generó el Executive Intelligence Briefing™ V6 con PDF Polish aplicado.",
        "Alta"
      );

      const doc = new jsPDF("p", "mm", "a4");

      const W = 210;
      const H = 297;
      type RGB = [number, number, number];

      const colors = {
        bg: [2, 6, 23] as RGB,
        panel: [7, 17, 31] as RGB,
        cyan: [34, 211, 238] as RGB,
        gold: [250, 204, 21] as RGB,
        red: [251, 113, 133] as RGB,
        green: [52, 211, 153] as RGB,
        purple: [168, 85, 247] as RGB,
        white: [255, 255, 255] as RGB,
        text: [226, 232, 240] as RGB,
        muted: [148, 163, 184] as RGB,
        dim: [71, 85, 105] as RGB,
      };

      const setRGB = (type: "fill" | "text" | "draw", rgb: RGB) => {
        if (type === "fill") doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        if (type === "text") doc.setTextColor(rgb[0], rgb[1], rgb[2]);
        if (type === "draw") doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      };

      const executiveClean = (value: unknown, fallback = "Operational") => {
        const v = String(value ?? "").trim();
        if (!v || v === "undefined" || v === "null" || v === "NaN") return fallback;
        return v;
      };

      const safeSignalCount = Array.isArray(signalEventEngine) ? signalEventEngine.length : 0;
      const safeTimeline = Array.isArray(timelineNeural) ? timelineNeural : [];
      const safeGroq =
        groqRespuesta?.trim() ||
        groqUltimaLectura?.trim() ||
        "BNS todavía no detecta suficientes señales para generar una lectura avanzada.";

      const contextualFallback = (tipo: string) => {
        switch (tipo) {
          case "Revenue":
          case "Revenue Forecast":
            return "Forecast bajo observación ejecutiva.";
          case "Realtime":
            return "Pulso operativo recibido correctamente.";
          case "BNS":
          case "Sistema":
            return "Neural Core sincronizado y operativo.";
          case "AI":
            return "IA ejecutiva monitoreando señales.";
          default:
            return "Sistema operativo estable.";
        }
      };

      const empresaPDF = executiveClean(nombreEmpresa, "Empresa sin registrar");

      const pageBg = () => {
        setRGB("fill", colors.bg);
        doc.rect(0, 0, W, H, "F");
        setRGB("fill", [4, 24, 44]);
        doc.circle(184, 25, 45, "F");
        setRGB("fill", [16, 12, 38]);
        doc.circle(18, 280, 62, "F");
      };

      const brandMark = (x: number, y: number, size = 14) => {
        setRGB("draw", colors.cyan);
        doc.setLineWidth(0.45);
        doc.roundedRect(x, y, size, size, 4, 4, "S");
        doc.circle(x + size / 2, y + size / 2, size * 0.28, "S");
        setRGB("fill", colors.cyan);
        doc.circle(x + size / 2, y + size / 2, size * 0.09, "F");
      };

      const header = (title: string, page: number) => {
        pageBg();
        brandMark(16, 14, 12);
        setRGB("text", colors.white);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("BNS", 32, 22);
        setRGB("text", colors.cyan);
        doc.setFontSize(6);
        doc.text("TM", 47, 17.5);
        setRGB("text", colors.text);
        doc.setFontSize(10);
        doc.text(title, 108, 22, { align: "center" });
        setRGB("text", colors.dim);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(empresaPDF, 194, 22, { align: "right" });
        setRGB("draw", [15, 53, 75]);
        doc.line(16, 34, 194, 34);
        setRGB("text", colors.dim);
        doc.setFontSize(7);
        doc.text(`Executive Intelligence Briefing V6 - ${fechaActual}`, 16, 284);
        doc.text(`Built by Alex Resendiz`, 132, 284, { align: "center" });
        doc.text(String(page), 194, 284, { align: "right" });
      };

      const panel = (x: number, y: number, w: number, h: number, tone: RGB = colors.cyan) => {
        setRGB("fill", colors.panel);
        doc.roundedRect(x, y, w, h, 5, 5, "F");
        setRGB("draw", [16, 78, 104]);
        doc.setLineWidth(0.35);
        doc.roundedRect(x, y, w, h, 5, 5, "S");
        setRGB("draw", tone);
        doc.setLineWidth(0.7);
        doc.line(x + 5, y + 1.2, x + 32, y + 1.2);
      };

      const label = (txt: string, x: number, y: number, rgb: RGB = colors.cyan) => {
        setRGB("text", rgb);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.2);
        doc.text(executiveClean(txt).toUpperCase(), x, y);
      };

      const wrapped = (txt: string, x: number, y: number, width: number, lineHeight = 5, size = 9) => {
        setRGB("text", colors.text);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(executiveClean(txt), width);
        doc.text(lines, x, y);
        return y + lines.length * lineHeight;
      };

      const metric = (x: number, y: number, w: number, title: string, value: string, tone: RGB) => {
        panel(x, y, w, 29, tone);
        label(title, x + 5, y + 9, tone);
        setRGB("text", colors.white);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(value.length > 10 ? 12 : 16);
        doc.text(executiveClean(value), x + 5, y + 21);
      };

      const executiveStatusColor = (value: string) => {
        switch (value) {
          case "Crítica":
          case "Alta":
            return colors.red;
          case "Media":
            return colors.gold;
          case "Baja":
            return colors.cyan;
          default:
            return colors.green;
        }
      };

      const signalTone = (severity: string) => {
        if (severity === "Crítica" || severity === "Alta") return colors.red;
        if (severity === "Media") return colors.gold;
        if (severity === "Baja") return colors.cyan;
        return colors.purple;
      };

      // 1. Cover
      pageBg();
      brandMark(18, 20, 18);
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("BNS", 42, 31);
      setRGB("text", colors.cyan);
      doc.setFontSize(7);
      doc.text("TM", 62, 24);
      setRGB("text", colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("EXECUTIVE INTELLIGENCE BRIEFING", 42, 39);

      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("Executive", 18, 78);
      doc.text("Intelligence Briefing", 18, 94);

      setRGB("text", colors.cyan);
      doc.setFontSize(8);
      doc.text("AI-POWERED ENTERPRISE INTERPRETATION", 18, 108);

      panel(18, 135, 174, 46, colors.purple);
      label("Empresa", 26, 149, colors.purple);
      setRGB("text", colors.white);
      doc.setFontSize(17);
      doc.text(empresaPDF, 26, 162);
      setRGB("text", colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Estado del sistema: ${executiveClean(pressureEngine.estadoGeneral, "Operativo")}`, 26, 173);

      metric(18, 201, 42, "BNS Index", `${safeNumber(bnsMetrics.bnsScore)}/100`, colors.cyan);
      metric(66, 201, 42, "Pressure", `${safePercent(pressureEngine.promedio)}%`, colors.gold);
      metric(114, 201, 42, "Forecast", `${safePercent(forecastIntelligence.confianza)}%`, colors.green);
      metric(162, 201, 30, "Signals", safeSignalCount > 0 ? `${safeSignalCount}` : "0", colors.red);

      setRGB("text", colors.red);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("CRITICAL SIGNAL DOCUMENT", 18, 256);
      setRGB("text", colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Generado: ${fechaActual}`, 18, 266);
      doc.text("Built by Alex Resendiz", 18, 274);

      // 2. Executive Diagnosis
      doc.addPage();
      header("Executive Diagnosis", 2);
      label("1. Diagnóstico ejecutivo", 18, 52, colors.cyan);
      panel(18, 61, 174, 94, colors.purple);

      const aiText = executiveClean(safeGroq, "BNS Executive Intelligence Engine activo.").replace(/\*\*/g, "");
      const aiLines = doc.splitTextToSize(aiText, 158);
      setRGB("text", colors.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.0);
      doc.text(aiLines.slice(0, 11), 26, 77);

      panel(18, 123, 174, 16, colors.purple);
      label("AI CONFIDENCE", 26, 132, colors.purple);
      setRGB("fill", [15, 23, 42]);
      doc.roundedRect(78, 128, 72, 4, 2, 2, "F");
      setRGB("fill", colors.purple);
      doc.roundedRect(78, 128, Math.max(10, (72 * safePercent(forecastIntelligence.confianza)) / 100), 4, 2, 2, "F");
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`${safePercent(forecastIntelligence.confianza)}%`, 156, 132);
      setRGB("text", colors.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text("Executive Intelligence Meter", 26, 137);

      const aiSummaryBlocks = [
        { title: "Forecast", body: "Riesgo alto de incumplimiento.", tone: colors.red },
        { title: "Dependencias", body: "CRM, WhatsApp y ERP aún no conectados.", tone: colors.gold },
        { title: "Dirección", body: "Se recomienda intervención ejecutiva.", tone: colors.cyan },
      ];

      aiSummaryBlocks.forEach((block, index) => {
        const x = 18 + index * 58;
        panel(x, 145, 52, 24, block.tone);
        label(block.title, x + 5, 153, block.tone);
        setRGB("text", colors.muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.text(doc.splitTextToSize(block.body, 42), x + 5, 160);
      });

      metric(18, 172, 40, "BNS", `${safeNumber(bnsMetrics.bnsScore)}/100`, colors.cyan);
      metric(62, 172, 40, "Forecast", `${safePercent(forecastIntelligence.confianza)}%`, colors.green);
      metric(106, 172, 40, "Pressure", `${safePercent(pressureEngine.promedio)}%`, colors.gold);
      metric(150, 172, 42, "Signals", safeSignalCount > 0 ? `${safeSignalCount}` : "0", colors.red);

      panel(18, 222, 174, 28, colors.gold);
      label("Lectura C-Level", 26, 235, colors.gold);
      wrapped("BNS detecta señales que requieren vigilancia ejecutiva. Dirección debe priorizar forecast, responsables, fuentes de datos e intervención sobre oportunidades críticas.", 26, 246, 158, 5, 7.4);

      const executiveInsightCards = [
        { title: "Forecast Risk", body: "Presión relevante sobre forecast y velocidad comercial.", tone: colors.red },
        { title: "Operational Stability", body: "La operación mantiene estabilidad y capacidad de crecimiento.", tone: colors.green },
        { title: "AI Intelligence", body: "La IA ejecutiva interpreta señales para acelerar decisiones.", tone: colors.purple },
      ];

      executiveInsightCards.forEach((card, index) => {
        const x = 18 + index * 58;
        panel(x, 258, 52, 20, card.tone);
        label(card.title, x + 5, 266, card.tone);
        setRGB("text", colors.muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.6);
        doc.text(doc.splitTextToSize(card.body, 42), x + 5, 272);
      });

      // 3. Signals
      doc.addPage();
      header("Live Enterprise Critical Signals", 3);
      label("2. Señales empresariales detectadas", 18, 52, colors.red);
      let y = 68;
      const signalsPDF = Array.isArray(signalEventEngine) && signalEventEngine.length > 0
        ? signalEventEngine.slice(0, 6)
        : [
            { area: "Revenue", severidad: "Crítica", titulo: "Revenue Forecast integrity weakening", detalle: "La confianza del forecast está bajo vigilancia." },
            { area: "AI", severidad: "Media", titulo: "AI executive monitoring active", detalle: "La IA ejecutiva mantiene observación organizacional." },
            { area: "Realtime", severidad: "Baja", titulo: "Operational pulse synchronized", detalle: "La sincronización operacional se mantiene estable." },
          ];

      signalsPDF.forEach((signal, index) => {
        const tone = signalTone(executiveClean(signal.severidad, "Media"));
        panel(18, y, 174, 28, tone);
        const severity = executiveClean(signal.severidad, "Media");
        label(`${index + 1}. ${executiveClean(signal.area)}`, 26, y + 9, tone);
        setRGB("fill", executiveStatusColor(severity));
        doc.roundedRect(150, y + 3, 26, 7, 2, 2, "F");
        setRGB("text", colors.bg);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.text(severity.toUpperCase(), 163, y + 8, { align: "center" });
        setRGB("text", colors.white);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.4);
        doc.text(doc.splitTextToSize(executiveClean(signal.titulo), 120), 26, y + 17);
        setRGB("text", colors.muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.2);
        doc.text(doc.splitTextToSize(executiveClean(signal.detalle, "Señal bajo observación ejecutiva."), 138), 26, y + 24);
        y += 35;
      });

      // 4. Recommended Actions
      doc.addPage();
      header("Recommended Executive Actions", 4);
      label("3. Decisiones recomendadas", 18, 52, colors.gold);

      const interventions = [
        "Revisar oportunidades en negociación y bloquear seguimiento ejecutivo inmediato.",
        "Usar la lectura IA para priorizar decisiones del boardroom.",
        "Mantener cadencia semanal de revisión ejecutiva.",
        "Sostener seguimiento preventivo sobre oportunidades activas.",
        "Mejorar conversión documentando objeciones, fuente de lead y siguiente paso.",
        "Mantener pocas acciones, pero con alto impacto y fecha compromiso.",
      ];

      y = 68;
      interventions.forEach((intervention, index) => {
        panel(18, y, 174, 22, index < 2 ? colors.red : colors.gold);
        label(`Intervención ${index + 1}`, 26, y + 9, index < 2 ? colors.red : colors.gold);
        wrapped(intervention, 26, y + 17, 150, 4, 7.5);
        y += 28;
      });

      label("4. Neural Timeline", 18, 240, colors.cyan);
      panel(18, 248, 174, 24, colors.cyan);
      wrapped("BNS Neural Core activo - señales, forecast y presión organizacional bajo vigilancia ejecutiva.", 26, 263, 158, 5, 8);

      // 5. Timeline
      doc.addPage();
      header("Neural Timeline", 5);
      label("5. Eventos recientes", 18, 52, colors.cyan);
      y = 70;
      const timelinePDF = safeTimeline.length > 0
        ? safeTimeline.slice(0, 8)
        : [
            { hora: "Sistema", tipo: "BNS", titulo: "BNS Neural Core activo", detalle: "Core operativo y sincronizado correctamente." },
            { hora: "Forecast", tipo: "Revenue", titulo: "Revenue Forecast bajo vigilancia", detalle: "Riesgo y desviación bajo monitoreo ejecutivo." },
          ];

      timelinePDF.forEach((event, index) => {
        const tone = index % 3 === 0 ? colors.cyan : index % 3 === 1 ? colors.gold : colors.purple;
        setRGB("draw", tone);
        doc.setLineWidth(0.8);
        doc.line(28, y - 4, 28, y + 23);
        setRGB("fill", tone);
        doc.circle(28, y, 2.2, "F");
        panel(38, y - 8, 154, 24, tone);
        label(`${executiveClean(event.hora)} - ${executiveClean(event.tipo)}`, 46, y + 1, tone);
        setRGB("text", colors.white);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(executiveClean(event.titulo), 46, y + 9);
        setRGB("text", colors.muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(
          doc.splitTextToSize(
            executiveClean(event.detalle, contextualFallback(executiveClean(event.tipo))),
            132
          ),
          46,
          y + 16
        );
        y += 31;
      });

      // 6. Closing
      doc.addPage();
      header("Executive Closing", 6);
      label("6. Conclusión ejecutiva", 18, 52, colors.cyan);
      panel(18, 66, 174, 58, colors.purple);
      wrapped(
        "BNS recomienda intervención directiva enfocada en forecast, ownership, trazabilidad comercial y conexión de fuentes pasivas. Las señales detectadas pueden afectar velocidad de decisión si no se atienden en el corto plazo.",
        26,
        84,
        158,
        5,
        9
      );

      panel(18, 150, 174, 42, colors.gold);
      label("BOARD DECISION", 26, 166, colors.gold);
      setRGB("text", colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(doc.splitTextToSize("Priorizar intervención ejecutiva, reasignar ownership y estabilizar forecast.", 148), 26, 180);

      doc.save(`BNS_Executive_Intelligence_Briefing_V6_${empresaPDF.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generando Brief IA PDF", error);
      registrarAuditoria(
        "PDF",
        "Error al generar Brief IA",
        error instanceof Error ? error.message : "Error desconocido al generar PDF IA.",
        "Alta"
      );
      alert("No se pudo generar el Brief IA. Revisa la consola para más detalle.");
    }
  }




  function actualizarNuevoEjecutivo(campo: keyof EjecutivoBNS, valor: string) {
    setNuevoEjecutivo((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function agregarEjecutivo() {
    if (nuevoEjecutivo.nombre.trim() === "" || nuevoEjecutivo.lider.trim() === "") {
      alert("Agrega al menos nombre del ejecutivo y líder responsable.");
      return;
    }

    const ejecutivo: EjecutivoBNS = {
      ...nuevoEjecutivo,
      id: `${Date.now()}`,
      pipeline: nuevoEjecutivo.pipeline.trim() === "" ? "0" : nuevoEjecutivo.pipeline.trim(),
      revenue: nuevoEjecutivo.revenue.trim() === "" ? "0" : nuevoEjecutivo.revenue.trim(),
      conversion: nuevoEjecutivo.conversion.trim() === "" ? "0" : nuevoEjecutivo.conversion.trim(),
      cargo: nuevoEjecutivo.cargo.trim() === "" ? "Ejecutivo" : nuevoEjecutivo.cargo.trim(),
    };

    setEjecutivos((actual) => [ejecutivo, ...actual]);
    await guardarEjecutivoSupabase(ejecutivo);
    setNuevoEjecutivo(ejecutivoVacio);
    setTabActiva("executive");
  }

  function eliminarEjecutivo(id: string) {
    setEjecutivos((actual) => actual.filter((ejecutivo) => ejecutivo.id !== id));
  }

  function abrirDetalle(detalle: Detalle) {
    setDetalleActivo(detalle);
  }

  function abrirDocumentoLegal(documento: DocumentoLegal) {
    setDocumentoActivo(documento);
  }

  const botonMenu = (tab: Tab, texto: string) => (
    <button
      onClick={() => navegarA(tab)}
      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
        tabActiva === tab
          ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
          : "text-gray-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      {texto}
    </button>
  );

  const tituloSeccion = {
    cuenta: "Account & Access",
    entrada: "Enterprise Setup",
    centro: "Command Center™",
    operaciones: "Operational Intelligence™",
    revenue: "Revenue Intelligence™",
    clientes: "Revenue Intelligence™",
    acciones: "Executive Actions™",
    importador: "Integrations Hub™",
    executive: "Executive Intelligence Layer™",
    forecast: "Revenue Forecast™",
    pressure: "Organizational Pressure™",
    digital: "Digital Intelligence™",
    liderazgo: "Leadership Intelligence™",
    senales: "Signal Map™",
    sitio: "Website Intelligence™",
    redes: "Social Radar™",
    whatsapp: "WhatsApp Intelligence™",
    diagnostico: "AI Diagnosis™",
    intelligence: "Executive AI™",
    crisis: "Critical Alerts™",
    permisos: "Security & Roles",
    legal: "Legal & Privacy",
    strategic: "Strategy Intelligence™",
    memory: "Enterprise Memory™",
    boardroom: "Boardroom™",
    integrations: "Integrations Hub™",
    mobile: "Mobile Executive™",
    audit: "Audit Trail",
    organization: "Organizational Intelligence™",
  };


  const enterpriseGroups: Array<{
    titulo: string;
    descripcion: string;
    icono: string;
    estado: string;
    tabs: Array<{ tab: Tab; texto: string; badge?: string }>;
  }> = [
    {
      titulo: "Command",
      descripcion: "Decisión ejecutiva",
      icono: "◈",
      estado: "Live",
      tabs: [
        { tab: "centro", texto: "Command Center", badge: `${safeNumber(bnsMetrics.bnsScore)}/100` },
        { tab: "boardroom", texto: "Boardroom" },
        { tab: "crisis", texto: "Critical Alerts" },
      ],
    },
    {
      titulo: "Revenue",
      descripcion: "Revenue Forecast y pipeline",
      icono: "▲",
      estado: forecastIntelligence.riesgoCumplimiento,
      tabs: [
        { tab: "clientes", texto: "Revenue Intelligence", badge: `${leads.length}` },
        { tab: "forecast", texto: "Revenue Revenue Forecast", badge: `${safePercent(forecastIntelligence.confianza)}%` },
      ],
    },
    {
      titulo: "Organization",
      descripcion: "Presión y liderazgo",
      icono: "◇",
      estado: "Org",
      tabs: [
        { tab: "organization", texto: "Org Intelligence" },
        { tab: "executive", texto: "Executive Heatmap", badge: `${executiveIntelligence.scorePromedio}` },
        { tab: "pressure", texto: "Org Pressure", badge: `${safePercent(pressureEngine.promedio)}%` },
      ],
    },
    {
      titulo: "Intelligence",
      descripcion: "IA ejecutiva",
      icono: "✦",
      estado: predictiveEngine.riesgoPredictivo,
      tabs: [
        { tab: "intelligence", texto: "Executive AI" },
        { tab: "strategic", texto: "Strategy Intelligence" },
        { tab: "integrations", texto: "Integrations Hub" },
        { tab: "whatsapp", texto: "WhatsApp Intel" },
      ],
    },
    {
      titulo: "Governance",
      descripcion: "Control y auditoría",
      icono: "◼",
      estado: authConectado ? "Auth" : "Open",
      tabs: [
        { tab: "cuenta", texto: "Account" },
        { tab: "permisos", texto: "Security" },
        { tab: "audit", texto: "Audit Trail" },
        { tab: "legal", texto: "Legal" },
      ],
    },
  ];

  const pageContext: Record<Tab, { title: string; description: string; question?: string }> = {
    cuenta: {
      title: "Account & Access",
      description: "Usuario, rol, empresa activa y acceso seguro.",
      question: "¿Quién entra y qué puede ver?",
    },
    entrada: {
      title: "Enterprise Setup",
      description: "Registra o selecciona el workspace que BNS™ debe interpretar.",
      question: "¿Qué empresa vamos a diagnosticar?",
    },
    centro: {
      title: "Command Center™",
      description: "Vista ejecutiva para detectar salud, riesgo, presión y prioridad.",
      question: "¿Qué está pasando ahora?",
    },
    operaciones: {
      title: "Operational Intelligence™",
      description: "Fricción, ejecución, atrasos, capacidad y continuidad operativa.",
      question: "¿Dónde se está frenando la operación?",
    },
    revenue: {
      title: "Revenue Intelligence™",
      description: "Pipeline, forecast, revenue at risk, conversión y oportunidades críticas.",
      question: "¿Dónde está el dinero y qué revenue está en riesgo?",
    },
    clientes: {
      title: "Revenue Intelligence™",
      description: "Segmentación de oportunidades por etapa, riesgo, temperatura y responsable.",
      question: "¿Qué oportunidades requieren acción?",
    },
    acciones: {
      title: "Executive Actions™",
      description: "Acciones críticas con responsable, fecha, impacto y siguiente paso.",
      question: "¿Qué se debe ejecutar primero?",
    },
    importador: {
      title: "Integrations Hub™",
      description: "CSV, Supabase y fuentes externas convertidas en señales ejecutivas.",
      question: "¿De dónde vienen los datos?",
    },
    executive: {
      title: "Executive Heatmap™",
      description: "Líderes, dependencia, presión humana, ownership y desempeño.",
      question: "¿Quién impulsa o frena el sistema?",
    },
    forecast: {
      title: "Revenue Forecast™",
      description: "Escenarios, confianza, gap vs meta y probabilidad de cumplimiento.",
      question: "¿Llegaremos a la meta?",
    },
    pressure: {
      title: "Organizational Pressure™",
      description: "Sobrecarga, cuellos de botella, saturación y fricción organizacional.",
      question: "¿Qué tan presionada está la empresa?",
    },
    digital: {
      title: "Digital Intelligence™",
      description: "Madurez digital, fuentes, web, canales y señales de captura.",
      question: "¿Qué tan preparada está la capa digital?",
    },
    liderazgo: {
      title: "Leadership Intelligence™",
      description: "Ownership, estilo de liderazgo, velocidad de decisión y dependencia.",
      question: "¿Dónde se concentra la decisión?",
    },
    senales: {
      title: "Signal Map™",
      description: "Alertas y señales generadas por datos, reglas, IA y realtime.",
      question: "¿Qué señales está detectando BNS™?",
    },
    sitio: {
      title: "Website Intelligence™",
      description: "Lectura web, presencia digital y potencial de conversión.",
      question: "¿El sitio ayuda o frena la conversión?",
    },
    redes: {
      title: "Social Radar™",
      description: "Señales sociales, reputación y captura de demanda.",
      question: "¿Qué está diciendo el mercado?",
    },
    whatsapp: {
      title: "WhatsApp Intelligence™",
      description: "Respuesta, conversaciones calientes, abandono y fricción comercial.",
      question: "¿Qué conversaciones requieren atención?",
    },
    diagnostico: {
      title: "AI Diagnosis™",
      description: "Diagnóstico consolidado por IA y lectura ejecutiva.",
      question: "¿Qué interpreta la IA?",
    },
    intelligence: {
      title: "Executive AI™",
      description: "Diagnóstico, riesgo, strategy, memory, escenarios e intervenciones.",
      question: "¿Qué debe saber dirección?",
    },
    crisis: {
      title: "Critical Alerts™",
      description: "Alertas que requieren intervención directiva inmediata.",
      question: "¿Qué no puede esperar?",
    },
    permisos: {
      title: "Security & Roles",
      description: "Roles, permisos y control de acceso por nivel ejecutivo.",
      question: "¿Quién tiene autorización?",
    },
    legal: {
      title: "Legal & Privacy",
      description: "Términos, privacidad, cumplimiento y lineamientos de uso.",
      question: "¿Qué reglas protegen el sistema?",
    },
    strategic: {
      title: "Strategy Intelligence™",
      description: "PESTEL, Porter, Cadena de Valor, 7S McKinsey, CAME y SOAR.",
      question: "¿Qué amenaza, fortalece o desbloquea la empresa?",
    },
    memory: {
      title: "Enterprise Memory™",
      description: "Patrones históricos, correlaciones y aprendizaje empresarial.",
      question: "¿Esto ya pasó antes?",
    },
    boardroom: {
      title: "Boardroom™",
      description: "Vista de decisión para CEO/CFO/CRO: riesgo, responsable e impacto.",
      question: "¿Qué decisión debe tomar dirección?",
    },
    integrations: {
      title: "Integrations Hub™",
      description: "Conexiones, estados, Supabase, IA, WhatsApp, CRM, ERP y APIs.",
      question: "¿Qué fuentes alimentan a BNS™?",
    },
    mobile: {
      title: "Mobile Executive™",
      description: "Señales críticas y decisiones rápidas desde móvil.",
      question: "¿Qué debe ver dirección en 30 segundos?",
    },
    audit: {
      title: "Audit Trail™",
      description: "Bitácora de IA, PDFs, datos, navegación, seguridad y gobierno.",
      question: "¿Qué ocurrió y quién lo hizo?",
    },
    organization: {
      title: "Organizational Intelligence™",
      description: "Mapa vivo de empresa, presión, liderazgo, dependencia y graph.",
      question: "¿Cómo se comporta el sistema humano?",
    },
  };



  const activeGroup =
    enterpriseGroups.find((group) =>
      group.tabs.some((item) => item.tab === tabActiva)
    ) || enterpriseGroups[0];

  const activeSubtitle =
    tabActiva === "centro"
      ? "Executive Command Center"
      : tabActiva === "clientes"
      ? "Pipeline, conversion and revenue signals"
      : tabActiva === "executive"
      ? "Leadership, dependency and performance layer"
      : tabActiva === "forecast"
      ? "Revenue scenarios, confidence and CFO visibility"
      : tabActiva === "pressure"
      ? "Organizational overload, bottlenecks and operating risk"
      : tabActiva === "importador"
      ? "Excel / CSV ingestion layer"
      : tabActiva === "audit"
      ? "Enterprise accountability and critical activity log"
      : tabActiva === "acciones"
      ? "Execution accountability and recommended actions"
      : "Enterprise intelligence workspace";

  const permisosPorRol: Record<Rol, Tab[]> = {
    Owner: [
      "cuenta",
      "entrada",
      "centro",
      "operaciones",
      "revenue",
      "clientes",
      "acciones",
      "importador",
      "executive",
      "forecast",
      "pressure",
      "digital",
      "liderazgo",
      "senales",
      "sitio",
      "redes",
      "whatsapp",
      "diagnostico",
      "intelligence",
      "crisis",
      "permisos",
      "legal",
      "audit",
      "strategic",
      "memory",
      "boardroom",
      "integrations",
      "mobile",
      "organization",
    ],
    Admin: [
      "cuenta",
      "centro",
      "clientes",
      "acciones",
      "importador",
      "executive",
      "forecast",
      "pressure",
      "digital",
      "whatsapp",
      "intelligence",
      "crisis",
      "permisos",
      "legal",
      "audit",
      "boardroom",
      "integrations",
      "organization",
    ],
    Manager: [
      "centro",
      "clientes",
      "acciones",
      "forecast",
      "pressure",
      "executive",
      "intelligence",
      "crisis",
      "boardroom",
      "organization",
    ],
    Analyst: [
      "centro",
      "clientes",
      "forecast",
      "pressure",
      "executive",
      "intelligence",
      "boardroom",
      "organization",
    ],
    Viewer: ["centro", "forecast", "intelligence", "boardroom"],
  };

  const tabsPermitidas = permisosPorRol[usuario.rol] || permisosPorRol.Viewer;

  const puedeVerTab = (tab: Tab) => tabsPermitidas.includes(tab);

  function navegarA(tab: Tab) {
    if (!puedeVerTab(tab)) {
      registrarAuditoria(
        "Seguridad",
        "Intento de acceso restringido",
        `El usuario intentó abrir la capa ${tab} sin permiso para el rol ${usuario.rol}.`,
        "Alta"
      );
      mostrarToastBNS(
        "error",
        "Acceso restringido",
        `Tu rol ${usuario.rol} no tiene permiso para abrir esta capa.`
      );
      return;
    }

    setTabActiva(tab);
    registrarAuditoria(
      "Navegación",
      "Cambio de capa",
      `El usuario abrió la capa ${tab}.`,
      "Baja"
    );
  }

const enterpriseMenuButton = (tab: Tab, texto: string, badge?: string) => (
    <button
      key={tab}
      onClick={() => navegarA(tab)}
      disabled={!puedeVerTab(tab)}
      className={`group flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition ${
        tabActiva === tab
          ? "border border-cyan-400/40 bg-cyan-400/15 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
          : puedeVerTab(tab)
          ? "border border-transparent text-gray-400 hover:border-white/10 hover:bg-white/10 hover:text-white"
          : "cursor-not-allowed border border-transparent text-gray-700 opacity-50"
      }`}
    >
      <span>{texto}</span>
      {badge && (
        <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] text-gray-300">
          {badge}
        </span>
      )}
    </button>
  );

  const tarjetaInteractiva = (
    titulo: string,
    valor: string,
    descripcion: string,
    color: string,
    fuente: string,
    accion: string
  ) => (
    <button
      onClick={() =>
        abrirDetalle({
          titulo,
          valor,
          descripcion,
          fuente,
          accion,
        })
      }
      className="rounded-3xl border border-cyan-500/20 bg-white/5 p-6 text-left backdrop-blur-xl transition hover:border-cyan-400/50 hover:bg-cyan-500/10"
    >
      <p className="text-sm text-cyan-300">{titulo}</p>

      <h3 className={`mt-4 text-3xl font-bold ${color}`}>{valor}</h3>

      <p className="mt-4 text-sm leading-6 text-gray-400">{descripcion}</p>

      <p className="mt-5 text-xs text-gray-500">Click para ver detalle</p>
    </button>
  );


  type ExecutiveCardTone = "intelligence" | "critical" | "executive" | "prediction" | "neutral" | "success";

  const getExecutiveCardTone = (tone: ExecutiveCardTone = "intelligence") => {
    const tones = {
      intelligence: {
        border: "border-cyan-500/20",
        glow: "shadow-[0_0_42px_rgba(34,211,238,0.075)]",
        bg: "from-cyan-500/[0.075] via-cyan-500/[0.018] to-transparent",
        icon: "text-cyan-200",
        badge: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
        pulse: "bg-cyan-300",
      },
      success: {
        border: "border-emerald-500/20",
        glow: "shadow-[0_0_42px_rgba(52,211,153,0.07)]",
        bg: "from-emerald-500/[0.075] via-emerald-500/[0.018] to-transparent",
        icon: "text-emerald-200",
        badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
        pulse: "bg-emerald-300",
      },
      critical: {
        border: "border-rose-500/20",
        glow: "shadow-[0_0_42px_rgba(251,113,133,0.075)]",
        bg: "from-rose-500/[0.075] via-rose-500/[0.018] to-transparent",
        icon: "text-rose-300",
        badge: "border-rose-400/20 bg-rose-400/10 text-rose-200",
        pulse: "bg-rose-400",
      },
      executive: {
        border: "border-yellow-500/20",
        glow: "shadow-[0_0_42px_rgba(250,204,21,0.075)]",
        bg: "from-yellow-500/[0.075] via-yellow-500/[0.018] to-transparent",
        icon: "text-yellow-200",
        badge: "border-yellow-400/20 bg-yellow-400/10 text-yellow-100",
        pulse: "bg-yellow-300",
      },
      prediction: {
        border: "border-purple-500/20",
        glow: "shadow-[0_0_42px_rgba(168,85,247,0.09)]",
        bg: "from-purple-500/[0.075] via-purple-500/[0.018] to-transparent",
        icon: "text-purple-200",
        badge: "border-purple-400/20 bg-purple-400/10 text-purple-100",
        pulse: "bg-purple-300",
      },
      neutral: {
        border: "border-white/10",
        glow: "shadow-[0_0_32px_rgba(255,255,255,0.025)]",
        bg: "from-white/[0.04] via-white/[0.01] to-transparent",
        icon: "text-gray-200",
        badge: "border-white/10 bg-white/[0.04] text-white/70",
        pulse: "bg-gray-300",
      },
    };

    return tones[tone];
  };

  const ExecutiveCard = ({
    title,
    subtitle,
    value,
    delta,
    status,
    tone = "intelligence",
    sparkline = [],
    footer,
    icon = "✦",
  }: {
    title: string;
    subtitle?: string;
    value: string;
    delta?: string;
    status?: string;
    tone?: ExecutiveCardTone;
    sparkline?: number[];
    footer?: string;
    icon?: string;
  }) => {
    const theme = getExecutiveCardTone(tone);
    const maxPoint = Math.max(...sparkline, 1);
    const points =
      sparkline.length > 1
        ? sparkline
            .map((point, index) => {
              const x = (index / (sparkline.length - 1)) * 300;
              const y = 76 - (safeNumber(point) / maxPoint) * 56;
              return `${x},${Math.max(8, Math.min(76, y))}`;
            })
            .join(" ")
        : "";

    return (
      <div
        className={`group relative overflow-hidden rounded-[28px] border bg-[#05070d]/95 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.01] ${theme.border} ${theme.glow}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br opacity-100 ${theme.bg}`} />
        <div className="absolute inset-[1px] rounded-[27px] border border-white/[0.03]" />
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div className="relative z-10 flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${theme.pulse} shadow-[0_0_12px_currentColor]`} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/38">
                  {title}
                </p>
              </div>

              {subtitle && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>

            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.03] text-lg transition-all duration-300 group-hover:scale-105 ${theme.icon}`}
            >
              {icon}
            </div>
          </div>

          <div className="mt-7">
            <div className="flex flex-wrap items-end gap-3">
              <h2 className="text-[34px] font-black leading-none tracking-[-0.05em] text-white">
                {value}
              </h2>

              {delta && (
                <span className={`mb-1 rounded-full border px-3 py-1 text-[10px] font-bold ${theme.badge}`}>
                  {delta}
                </span>
              )}
            </div>

            {status && <p className="mt-3 text-sm text-white/55">{status}</p>}
          </div>

          {sparkline.length > 1 && (
            <div className="relative mt-6 h-16 overflow-hidden rounded-2xl border border-white/[0.04] bg-black/20">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <svg viewBox="0 0 300 80" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="rgba(34,211,238,0.55)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              </svg>
            </div>
          )}

          {footer && (
            <div className="mt-5 flex items-center justify-between border-t border-white/[0.04] pt-4">
              <p className="text-xs text-white/40">{footer}</p>
              <span className="rounded-xl border border-white/[0.05] bg-white/[0.03] px-3 py-2 text-[10px] font-semibold text-white/60 transition-all duration-300 group-hover:border-cyan-400/20 group-hover:bg-cyan-400/10 group-hover:text-cyan-100">
                Ver detalle
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!sesionActiva) {
    return (
      <main className="min-h-screen bg-black text-white">
        {toastBNS && (
          <div className="fixed right-6 top-6 z-[80] w-[360px] rounded-3xl border border-cyan-500/20 bg-black/90 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  toastBNS.tipo === "ok"
                    ? "bg-green-400 shadow-[0_0_18px_rgba(74,222,128,0.9)]"
                    : toastBNS.tipo === "error"
                    ? "bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.9)]"
                    : "bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
                }`}
              />
              <div>
                <p className="text-sm font-bold text-white">{toastBNS.titulo}</p>
                <p className="mt-1 text-xs leading-5 text-gray-400">{toastBNS.mensaje}</p>
              </div>
              <button
                type="button"
                onClick={() => setToastBNS(null)}
                className="ml-auto text-xs text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <section className="relative flex min-h-screen overflow-hidden">
          <div className="absolute left-[-200px] top-[-200px] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-[-200px] right-[-200px] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative z-10 grid min-h-screen w-full grid-cols-1 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-between border-r border-white/10 p-10 xl:p-14">
              <div>
                <p className="text-sm tracking-[0.5em] text-cyan-400">BNS™</p>

                <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Enterprise Access Layer • Live Preview
                </div>

                <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-tight xl:text-6xl">
                  Command Center para entender, proteger y acelerar una empresa.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-gray-400">
                  BNS centraliza señales de operación, ingresos, liderazgo,
                  digital, soporte y riesgo empresarial. Antes de analizar una
                  empresa, valida identidad, departamento, rol de acceso,
                  consentimiento y autorización.
                </p>

                <div className="mt-8 rounded-3xl border border-cyan-500/20 bg-black/40 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs tracking-[0.3em] text-cyan-300">
                      PROCESO DE ACCESO BNS™
                    </p>
                    <p className="text-xs text-gray-500">Antes de analizar una empresa</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-300">
                      01 Tu identidad
                    </div>
                    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-300">
                      02 Empresa
                    </div>
                    <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-green-300">
                      03 Roles y permisos
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-5">
                  <p className="text-xs tracking-[0.3em] text-cyan-300">
                    IDENTIDAD
                  </p>
                  <h3 className="mt-3 text-xl font-bold">Cuenta personal</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Cada persona entra con su propio usuario.
                  </p>
                </div>

                <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                  <p className="text-xs tracking-[0.3em] text-yellow-300">
                    SEGURIDAD
                  </p>
                  <h3 className="mt-3 text-xl font-bold">Datos protegidos</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Supabase Auth y RLS activos para proteger sesiones y datos.
                  </p>
                </div>

                <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-5">
                  <p className="text-xs tracking-[0.3em] text-green-300">
                    APROBACIÓN
                  </p>
                  <h3 className="mt-3 text-xl font-bold">Acceso controlado</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Viewer requiere autorización interna.
                  </p>
                </div>
              </div>

              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-semibold text-gray-200">
                  Principio BNS de seguridad
                </p>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Cada usuario debe tener una identidad propia. Cada empresa
                  debe tener responsables, miembros, roles y trazabilidad.
                  Los datos no deben mezclarse entre empresas.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center p-6 xl:p-12">
              <div className="w-full max-w-2xl rounded-[2rem] border border-cyan-500/20 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => setModoAuth("registro")}
                    className={`rounded-2xl px-5 py-3 text-sm font-bold ${
                      modoAuth === "registro"
                        ? "bg-cyan-400 text-black"
                        : "border border-white/10 text-gray-400"
                    }`}
                  >
                    Crear cuenta
                  </button>

                  <button
                    onClick={() => setModoAuth("login")}
                    className={`rounded-2xl px-5 py-3 text-sm font-bold ${
                      modoAuth === "login"
                        ? "bg-cyan-400 text-black"
                        : "border border-white/10 text-gray-400"
                    }`}
                  >
                    Iniciar sesión
                  </button>

                  <button
                    onClick={() => setModoAuth("solicitar")}
                    className={`rounded-2xl px-5 py-3 text-sm font-bold ${
                      modoAuth === "solicitar"
                        ? "bg-cyan-400 text-black"
                        : "border border-white/10 text-gray-400"
                    }`}
                  >
                    Solicitar acceso
                  </button>
                </div>

                <div className="mb-8">
                  <p className="text-sm tracking-[0.3em] text-cyan-300">
                    ACCESO EJECUTIVO
                  </p>

                  <h2 className="mt-3 text-3xl font-bold">
                    {modoAuth === "registro"
                      ? "Crear cuenta autorizada"
                      : modoAuth === "login"
                      ? "Entrar a BNS"
                      : modoAuth === "recuperar"
                      ? modoResetPassword
                        ? "Crear nueva contraseña"
                        : "Recuperar contraseña"
                      : "Solicitar acceso a una empresa"}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {modoAuth === "solicitar"
                      ? "El acceso como espectador o invitado debe ser aprobado por un responsable autorizado de la empresa."
                      : modoAuth === "recuperar"
                      ? modoResetPassword
                        ? "Escribe y confirma tu nueva contraseña para finalizar la recuperación."
                        : "Ingresa tu email y BNS™ enviará un correo de recuperación mediante Supabase Auth."
                      : authConectado
                      ? "Sesión real activa con Supabase Auth."
                      : "Acceso conectado a Supabase Auth para sesiones reales."}
                  </p>
                </div>

                {modoAuth !== "solicitar" && modoAuth !== "recuperar" && (
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {modoAuth === "registro" && (
                      <>
                        <input
                          value={usuario.nombre}
                          onChange={(event) =>
                            actualizarUsuario("nombre", event.target.value)
                          }
                          placeholder="Nombre completo"
                          className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                        />

                        <input
                          value={usuario.telefono}
                          onChange={(event) =>
                            actualizarUsuario("telefono", event.target.value)
                          }
                          placeholder="Teléfono"
                          className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                        />

                        <input
                          value={usuario.cargo}
                          onChange={(event) =>
                            actualizarUsuario("cargo", event.target.value)
                          }
                          placeholder="Puesto específico, ejemplo: Director Comercial"
                          className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                        />

                        <select
                          value={usuario.departamento}
                          onChange={(event) =>
                            actualizarUsuario("departamento", event.target.value)
                          }
                          className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none"
                        >
                          <option>Dirección General</option>
                          <option>Finanzas / CFO</option>
                          <option>Comercial</option>
                          <option>Operaciones</option>
                          <option>Marketing</option>
                          <option>Soporte</option>
                          <option>Recursos Humanos</option>
                          <option>Tecnología / Sistemas</option>
                          <option>Legal / Compliance</option>
                          <option>Analítica / BI</option>
                          <option>Otro</option>
                        </select>
                      </>
                    )}

                    <input
                      value={usuario.email}
                      onChange={(event) =>
                        actualizarUsuario("email", event.target.value)
                      }
                      placeholder="Email corporativo"
                      className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <div>
                      <input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Contraseña"
                        type="password"
                        className="w-full rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                      />

                      {modoAuth === "login" && (
                        <button
                          type="button"
                          onClick={() => setModoAuth("recuperar")}
                          className="mt-3 text-xs font-semibold text-cyan-300 transition hover:text-cyan-100 hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      )}
                    </div>

                    {modoAuth === "registro" && (
                      <select
                        value={usuario.rol}
                        onChange={(event) =>
                          actualizarUsuario("rol", event.target.value)
                        }
                        className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none xl:col-span-2"
                      >
                        <option>Owner</option>
                        <option>Admin</option>
                        <option>Manager</option>
                        <option>Analyst</option>
                        <option>Viewer</option>
                      </select>
                    )}
                  </div>
                )}

                {modoAuth === "recuperar" && (
                  <div className="grid grid-cols-1 gap-5">
                    {modoResetPassword ? (
                      <>
                        <input
                          value={nuevaPasswordReset}
                          onChange={(event) => setNuevaPasswordReset(event.target.value)}
                          placeholder="Nueva contraseña"
                          type="password"
                          className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                        />

                        <input
                          value={confirmarPasswordReset}
                          onChange={(event) => setConfirmarPasswordReset(event.target.value)}
                          placeholder="Confirmar nueva contraseña"
                          type="password"
                          className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                        />

                        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm leading-6 text-green-100">
                          BNS™ detectó una recuperación activa. Escribe tu nueva contraseña para finalizar el cambio.
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          value={usuario.email}
                          onChange={(event) =>
                            actualizarUsuario("email", event.target.value)
                          }
                          placeholder="Email de tu cuenta"
                          className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                        />

                        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
                          BNS™ enviará un enlace seguro para restablecer la contraseña al correo registrado.
                        </div>
                      </>
                    )}
                  </div>
                )}

                {modoAuth === "solicitar" && (
                  <div className="grid grid-cols-1 gap-5">
                    <input
                      value={usuario.nombre}
                      onChange={(event) =>
                        actualizarUsuario("nombre", event.target.value)
                      }
                      placeholder="Nombre completo"
                      className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <input
                      value={usuario.email}
                      onChange={(event) =>
                        actualizarUsuario("email", event.target.value)
                      }
                      placeholder="Email corporativo"
                      className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <input
                      value={empresaSolicitada}
                      onChange={(event) => setEmpresaSolicitada(event.target.value)}
                      placeholder="Empresa a la que solicitas acceso"
                      className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <textarea
                      value={motivoAcceso}
                      onChange={(event) => setMotivoAcceso(event.target.value)}
                      placeholder="Motivo de acceso"
                      className="min-h-28 rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />
                  </div>
                )}

                {modoAuth === "registro" && (
                  <div className="mt-6 space-y-4">
                    <label className="flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={aceptaPrivacidad}
                        onChange={(event) =>
                          setAceptaPrivacidad(event.target.checked)
                        }
                      />
                      <span>
                        Acepto el aviso de privacidad.
                        <button
                          type="button"
                          onClick={() => abrirDocumentoLegal(documentosLegales.privacidad)}
                          className="ml-2 text-cyan-300 underline"
                        >
                          Ver documento
                        </button>
                      </span>
                    </label>

                    <label className="flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={aceptaTratamiento}
                        onChange={(event) =>
                          setAceptaTratamiento(event.target.checked)
                        }
                      />
                      <span>
                        Acepto el tratamiento de datos para operar BNS.
                        <button
                          type="button"
                          onClick={() => abrirDocumentoLegal(documentosLegales.tratamiento)}
                          className="ml-2 text-cyan-300 underline"
                        >
                          Ver documento
                        </button>
                      </span>
                    </label>

                    <label className="flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={aceptaAutorizacion}
                        onChange={(event) =>
                          setAceptaAutorizacion(event.target.checked)
                        }
                      />
                      Confirmo que tengo facultades o autorización de la empresa
                      para registrar información y solicitar análisis.
                    </label>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={
                      modoAuth === "registro"
                        ? crearCuenta
                        : modoAuth === "login"
                        ? iniciarSesion
                        : modoAuth === "recuperar"
                        ? modoResetPassword
                          ? actualizarPasswordRecuperacion
                          : recuperarPassword
                        : solicitarAcceso
                    }
                    className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-8 py-4 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/25"
                  >
                    {modoAuth === "registro"
                      ? "Crear cuenta segura"
                      : modoAuth === "login"
                      ? "Entrar"
                      : modoAuth === "recuperar"
                      ? modoResetPassword
                        ? "Actualizar contraseña"
                        : "Enviar recuperación"
                      : "Enviar solicitud"}
                  </button>

                  <button
                    type="button"
                    onClick={() => abrirDocumentoLegal(documentosLegales.permisos)}
                    className="rounded-2xl border border-white/10 px-6 py-4 text-sm font-semibold text-gray-400 transition hover:text-white hover:bg-white/5"
                  >
                    Ver política de permisos
                  </button>
                </div>

                <p className="mt-5 text-xs text-yellow-300">
                  {authConectado ? "Sesión protegida por Supabase Auth." : mensajeAuth}
                </p>
              </div>
            </div>
          </div>
        </section>

        {documentoActivo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
            <div className="w-full max-w-3xl rounded-3xl border border-cyan-500/20 bg-black p-8 shadow-2xl">
              <p className="text-sm tracking-[0.3em] text-cyan-300">
                DOCUMENTO BNS™
              </p>

              <h2 className="mt-4 text-3xl font-bold">{documentoActivo.titulo}</h2>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                {documentoActivo.descripcion}
              </p>

              <div className="mt-6 space-y-3">
                {documentoActivo.contenido.map((linea) => (
                  <div
                    key={linea}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300"
                  >
                    {linea}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setDocumentoActivo(null)}
                className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-sm font-bold text-cyan-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-black text-white">
      {toastBNS && (
        <div className="fixed right-6 top-6 z-[80] w-[360px] rounded-3xl border border-cyan-500/20 bg-black/90 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <span
              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                toastBNS.tipo === "ok"
                  ? "bg-green-400 shadow-[0_0_18px_rgba(74,222,128,0.9)]"
                  : toastBNS.tipo === "error"
                  ? "bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.9)]"
                  : "bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
              }`}
            />
            <div>
              <p className="text-sm font-bold text-white">{toastBNS.titulo}</p>
              <p className="mt-1 text-xs leading-5 text-gray-400">{toastBNS.mensaje}</p>
            </div>
            <button
              type="button"
              onClick={() => setToastBNS(null)}
              className="ml-auto text-xs text-gray-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <style jsx global>{`

                @keyframes bnsCoreAura {
                  0%, 100% {
                    opacity: 0.45;
                    transform: translate(-50%, -50%) scale(0.94);
                  }
                  50% {
                    opacity: 0.9;
                    transform: translate(-50%, -50%) scale(1.08);
                  }
                }

                @keyframes bnsDependencyFlow {
                  0% {
                    stroke-dashoffset: 90;
                    opacity: 0.24;
                  }
                  42% {
                    opacity: 0.78;
                  }
                  100% {
                    stroke-dashoffset: -90;
                    opacity: 0.24;
                  }
                }

                @keyframes bnsOrbBreath {
                  0%, 100% {
                    filter: brightness(1);
                    transform: translateX(-50%) scale(1);
                  }
                  50% {
                    filter: brightness(1.18);
                    transform: translateX(-50%) scale(1.035);
                  }
                }

                @keyframes bnsNodeSpark {
                  0%, 100% {
                    opacity: 0.35;
                    transform: scale(0.86);
                  }
                  50% {
                    opacity: 1;
                    transform: scale(1.15);
                  }
                }


                @keyframes bnsCoreAura {
                  0%, 100% {
                    opacity: 0.45;
                    transform: translate(-50%, -50%) scale(0.94);
                  }
                  50% {
                    opacity: 0.9;
                    transform: translate(-50%, -50%) scale(1.08);
                  }
                }

                @keyframes bnsDependencyFlow {
                  0% {
                    stroke-dashoffset: 90;
                    opacity: 0.24;
                  }
                  42% {
                    opacity: 0.78;
                  }
                  100% {
                    stroke-dashoffset: -90;
                    opacity: 0.24;
                  }
                }

                @keyframes bnsNodeBreath {
                  0%, 100% {
                    filter: brightness(1);
                  }
                  50% {
                    filter: brightness(1.16);
                  }
                }

                @keyframes bnsNodeSpark {
                  0%, 100% {
                    opacity: 0.35;
                    transform: scale(0.86);
                  }
                  50% {
                    opacity: 1;
                    transform: scale(1.15);
                  }
                }


                @keyframes bnsDependencyFlow {
                  0% {
                    stroke-dashoffset: 80;
                    opacity: 0.28;
                  }
                  40% {
                    opacity: 0.9;
                  }
                  100% {
                    stroke-dashoffset: -80;
                    opacity: 0.28;
                  }
                }

                @keyframes bnsFieldBreath {
                  0%, 100% {
                    opacity: 0.35;
                    transform: translate(-50%, -50%) scale(0.96);
                  }
                  50% {
                    opacity: 0.78;
                    transform: translate(-50%, -50%) scale(1.08);
                  }
                }

                @keyframes bnsNodeBreath {
                  0%, 100% {
                    filter: brightness(1);
                  }
                  50% {
                    filter: brightness(1.18);
                  }
                }

                @keyframes bnsNodeSpark {
                  0%, 100% {
                    opacity: 0.35;
                    transform: scale(0.86);
                  }
                  50% {
                    opacity: 1;
                    transform: scale(1.15);
                  }
                }

                @keyframes bnsPulseDrift {
                  0%, 100% {
                    opacity: 0.55;
                    transform: translateY(0);
                  }
                  50% {
                    opacity: 1;
                    transform: translateY(-3px);
                  }
                }


                @keyframes bnsEcgPulse {
                  0% {
                    stroke-dashoffset: 420;
                    opacity: 0.24;
                  }
                  10% {
                    opacity: 1;
                  }
                  72% {
                    stroke-dashoffset: 0;
                    opacity: 1;
                  }
                  100% {
                    stroke-dashoffset: -420;
                    opacity: 0.18;
                  }
                }

                @keyframes bnsLowPulse {
                  0% {
                    stroke-dashoffset: 460;
                    opacity: 0.18;
                  }
                  18% {
                    opacity: 0.72;
                  }
                  76% {
                    stroke-dashoffset: 0;
                    opacity: 0.65;
                  }
                  100% {
                    stroke-dashoffset: -460;
                    opacity: 0.16;
                  }
                }

                @keyframes bnsReactivePulse {
                  0% {
                    stroke-dashoffset: 420;
                    opacity: 0.28;
                  }
                  8% {
                    opacity: 1;
                  }
                  66% {
                    stroke-dashoffset: 0;
                    opacity: 1;
                  }
                  100% {
                    stroke-dashoffset: -420;
                    opacity: 0.18;
                  }
                }

                @keyframes bnsIdleHeartbeat {
                  0% {
                    stroke-dashoffset: 500;
                    opacity: 0.20;
                  }
                  16% {
                    opacity: 0.48;
                  }
                  70% {
                    stroke-dashoffset: 0;
                    opacity: 0.44;
                  }
                  100% {
                    stroke-dashoffset: -500;
                    opacity: 0.20;
                  }
                }

                @keyframes bnsStandbyLight {
                  0%, 100% {
                    opacity: 0.45;
                    transform: scale(0.92);
                  }
                  50% {
                    opacity: 1;
                    transform: scale(1.08);
                  }
                }


                @keyframes bnsEcgPulse {
                  0% {
                    stroke-dashoffset: 420;
                    opacity: 0.2;
                  }
                  12% {
                    opacity: 1;
                  }
                  72% {
                    stroke-dashoffset: 0;
                    opacity: 1;
                  }
                  100% {
                    stroke-dashoffset: -420;
                    opacity: 0.12;
                  }
                }


                .line-clamp-2 {
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }


                :root {
                  --bns-bg: #020617;
                  --bns-surface: #05070d;
                  --bns-intelligence: #22d3ee;
                  --bns-executive: #facc15;
                  --bns-critical: #fb7185;
                  --bns-ai: #a855f7;
                  --bns-ease: cubic-bezier(0.22, 1, 0.36, 1);
                }

                .bns-wordmark {
                  letter-spacing: -0.045em;
                  text-shadow: 0 0 24px rgba(34, 211, 238, 0.10);
                }

                .bns-brand-mark {
                  box-shadow:
                    inset 0 0 0 1px rgba(255, 255, 255, 0.025),
                    0 0 28px rgba(34, 211, 238, 0.10);
                  isolation: isolate;
                  background:
                    radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.18), rgba(2, 8, 23, 0.70) 38%, rgba(2, 8, 23, 0.96) 72%);
                }

                .bns-brand-fallback-stable {
                  display: none;
                }

                .bns-brand-mark::before {
                  content: "";
                  position: absolute;
                  inset: -35%;
                  background:
                    radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.20), transparent 34%),
                    conic-gradient(from 180deg, transparent, rgba(34, 211, 238, 0.22), transparent, rgba(168, 85, 247, 0.16), transparent);
                  opacity: 0.65;
                  filter: blur(1px);
                  animation: bnsBrandRotate 9s linear infinite;
                }

                .bns-brand-mark::after {
                  content: "";
                  position: absolute;
                  inset: 8px;
                  border-radius: 16px;
                  background: radial-gradient(circle at center, rgba(34, 211, 238, 0.10), rgba(2, 8, 23, 0.76) 62%, rgba(2, 8, 23, 0.92));
                  z-index: 0;
                }

                .bns-brand-orbit {
                  position: absolute;
                  border-radius: 999px;
                  border: 1px solid rgba(34, 211, 238, 0.22);
                  z-index: 1;
                }

                .bns-brand-orbit-a {
                  width: 28px;
                  height: 28px;
                  animation: bnsBrandPulse 3.8s var(--bns-ease) infinite;
                }

                .bns-brand-orbit-b {
                  width: 19px;
                  height: 19px;
                  border-color: rgba(168, 85, 247, 0.18);
                  animation: bnsBrandPulse 4.6s var(--bns-ease) infinite reverse;
                }

                .bns-brand-core-ring {
                  position: absolute;
                  width: 13px;
                  height: 13px;
                  border-radius: 999px;
                  border: 1px solid rgba(34, 211, 238, 0.42);
                  background: rgba(2, 8, 23, 0.80);
                  z-index: 2;
                }

                .bns-brand-core {
                  position: absolute;
                  width: 6px;
                  height: 6px;
                  border-radius: 999px;
                  background: rgba(103, 232, 249, 0.95);
                  box-shadow: 0 0 18px rgba(34, 211, 238, 0.92);
                  z-index: 3;
                  animation: bnsBrandCore 2.8s var(--bns-ease) infinite;
                }

                .bns-brand-signal {
                  position: absolute;
                  height: 1px;
                  width: 11px;
                  border-radius: 999px;
                  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.68), transparent);
                  z-index: 2;
                  opacity: 0.55;
                }

                .bns-brand-signal-a {
                  transform: translateX(12px) rotate(24deg);
                }

                .bns-brand-signal-b {
                  transform: translateX(-12px) rotate(204deg);
                }

                @keyframes bnsBrandRotate {
                  from {
                    transform: rotate(0deg);
                  }
                  to {
                    transform: rotate(360deg);
                  }
                }

                @keyframes bnsBrandPulse {
                  0%,
                  100% {
                    opacity: 0.38;
                    transform: scale(0.96);
                  }
                  50% {
                    opacity: 0.82;
                    transform: scale(1.04);
                  }
                }

                @keyframes bnsBrandCore {
                  0%,
                  100% {
                    filter: brightness(0.96);
                    transform: scale(0.96);
                  }
                  50% {
                    filter: brightness(1.22);
                    transform: scale(1.12);
                  }
                }


        .bns-sidebar-scroll {
                  scrollbar-width: thin;
                  scrollbar-color: rgba(34, 211, 238, 0.05) transparent !important;
                }

                .bns-sidebar-scroll:hover {
                  scrollbar-color: rgba(34, 211, 238, 0.22) rgba(2, 8, 23, 0.18) !important;
                }

                .bns-sidebar-scroll::-webkit-scrollbar {
                  width: 2px !important;
                }

                .bns-sidebar-scroll::-webkit-scrollbar-track {
                  background: transparent;
                  border-radius: 999px;
                  margin: 26px 0;
                }

                .bns-sidebar-scroll::-webkit-scrollbar-thumb {
                  background: rgba(34, 211, 238, 0.08);
                  border-radius: 999px;
                  transition: background 220ms ease, opacity 220ms ease;
                  opacity: 0;
                }

                .bns-sidebar-scroll:hover::-webkit-scrollbar-thumb {
                  background: rgba(34, 211, 238, 0.28);
                  opacity: 1;
                }

                .bns-sidebar-scroll::-webkit-scrollbar-thumb:hover {
                  background: rgba(34, 211, 238, 0.42);
                  opacity: 1;
                }


                        @keyframes bnsNeuralOrbit {
                          0% {
                            transform: rotate(0deg) scale(1);
                            opacity: 0.35;
                          }
                          50% {
                            transform: rotate(180deg) scale(1.04);
                            opacity: 0.75;
                          }
                          100% {
                            transform: rotate(360deg) scale(1);
                            opacity: 0.35;
                          }
                        }

                        @keyframes bnsNeuralOrbitReverse {
                          0% {
                            transform: rotate(360deg) scale(1.02);
                            opacity: 0.28;
                          }
                          50% {
                            transform: rotate(180deg) scale(0.96);
                            opacity: 0.68;
                          }
                          100% {
                            transform: rotate(0deg) scale(1.02);
                            opacity: 0.28;
                          }
                        }

                        @keyframes bnsNeuralBreath {
                          0%,
                          100% {
                            opacity: 0.22;
                            transform: scale(0.92);
                            box-shadow: 0 0 0 rgba(34, 211, 238, 0);
                          }
                          50% {
                            opacity: 0.85;
                            transform: scale(1.08);
                            box-shadow: 0 0 40px rgba(34, 211, 238, 0.22);
                          }
                        }

                        @keyframes bnsEnergyLine {
                          0%,
                          100% {
                            opacity: 0.35;
                            filter: drop-shadow(0 0 2px rgba(34, 211, 238, 0.25));
                          }
                          50% {
                            opacity: 1;
                            filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.8));
                          }
                        }

                        @keyframes bnsNodePulse {
                          0%,
                          100% {
                            transform: translate(-50%, -50%) scale(1);
                            filter: brightness(1);
                          }
                          50% {
                            transform: translate(-50%, -50%) scale(1.055);
                            filter: brightness(1.3);
                          }
                        }

                        @keyframes bnsMicroBlink {
                          0%,
                          100% {
                            opacity: 0.25;
                            transform: scale(0.65);
                          }
                          50% {
                            opacity: 1;
                            transform: scale(1.35);
                          }
                        }

                        @keyframes bnsCoreBreath {
                          0%,
                          100% {
                            filter: brightness(1);
                          }
                          50% {
                            filter: brightness(1.55);
                          }
                        }

                        @keyframes bnsSignalSlide {
                          0% {
                            transform: translateX(0);
                          }
                          100% {
                            transform: translateX(-50%);
                          }
                        }

                        @keyframes bnsSignalBlink {
                          0%,
                          100% {
                            opacity: 0.25;
                            transform: translateY(-50%) scale(0.75);
                          }
                          50% {
                            opacity: 1;
                            transform: translateY(-50%) scale(1.28);
                          }
                        }
      `}</style>

<button
        type="button"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label={sidebarCollapsed ? "Expandir navegación" : "Contraer navegación"}
        title={sidebarCollapsed ? "Expandir navegación" : "Contraer navegación"}
        className={`fixed top-[4.9rem] z-[95] flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/16 bg-[#06111f]/88 text-cyan-200 shadow-[0_10px_28px_rgba(2,8,23,0.54)] backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-105 hover:border-cyan-300/42 hover:bg-cyan-400/10 hover:shadow-[0_14px_36px_rgba(34,211,238,0.18)] ${
          sidebarCollapsed ? "left-[4.88rem]" : "left-[15.85rem]"
        }`}
      >
        <span className="text-base font-black leading-none">
          {sidebarCollapsed ? "›" : "‹"}
        </span>
      </button>

<aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-white/10 bg-[#05070d]/95 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarCollapsed ? "w-[5rem]" : "w-[16.25rem]"
        }`}
      >

        <div className="relative shrink-0 border-b border-white/10 px-4 pb-4 pt-5">
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="bns-brand-mark relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.055]">
              <div className="bns-brand-orbit bns-brand-orbit-a" />
              <div className="bns-brand-orbit bns-brand-orbit-b" />
              <div className="bns-brand-core-ring" />
              <div className="bns-brand-core" />
              <div className="bns-brand-signal bns-brand-signal-a" />
              <div className="bns-brand-signal bns-brand-signal-b" />
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-start gap-1">
                  <h1 className="bns-wordmark text-[22px] font-black leading-none tracking-[-0.04em] text-white">
                    BNS
                  </h1>
                  <span className="mt-0.5 text-[10px] font-black leading-none text-cyan-300">™</span>
                </div>
                <p className="mt-1 text-[8px] uppercase tracking-[0.28em] text-white/38">
                  Business Nervous System
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="bns-sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-4 pl-2.5 pr-5">
          <div className="space-y-3">
            {enterpriseGroups
              .map((grupo) => ({
                ...grupo,
                tabs: grupo.tabs.filter((item) => puedeVerTab(item.tab)),
              }))
              .filter((grupo) => grupo.tabs.length > 0)
              .map((grupo) => (
                <div key={grupo.titulo}>
                  {!sidebarCollapsed && (
                    <p className="mb-2 px-3 text-[9px] uppercase tracking-[0.28em] text-gray-600">
                      {grupo.titulo}
                    </p>
                  )}

                  <div className="space-y-0.5">
                    {grupo.tabs.map((item) => (
                      <button
                        key={item.tab}
                        type="button"
                        title={item.texto}
                        onClick={() => navegarA(item.tab)}
                        className={`group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-xs transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          tabActiva === item.tab
                            ? "border-cyan-400/28 bg-cyan-400/[0.085] text-cyan-50 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08),0_0_20px_rgba(34,211,238,0.085)]"
                            : "border-transparent text-gray-400 hover:-translate-y-px hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                        } ${sidebarCollapsed ? "justify-center px-0 py-1" : "justify-between"}`}
                      >
                        {tabActiva === item.tab && (
                          <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r-full bg-cyan-300/55 shadow-[0_0_9px_rgba(34,211,238,0.32)]" />
                        )}

                        {sidebarCollapsed && (
                          <span className="pointer-events-none absolute left-[4.25rem] top-1/2 z-[120] hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-cyan-400/20 bg-[#07111f]/95 px-3 py-2 text-[11px] font-semibold text-cyan-50 shadow-[0_18px_42px_rgba(2,8,23,0.72)] backdrop-blur-xl group-hover:block">
                            {item.texto}
                          </span>
                        )}

                        <span className={`flex min-w-0 items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-sm ${
                              tabActiva === item.tab
                                ? "bg-cyan-400/10 text-cyan-300"
                                : "text-gray-500 transition-all duration-300 group-hover:scale-105 group-hover:text-cyan-300 group-hover:shadow-[0_0_18px_rgba(34,211,238,0.08)]"
                            }`}
                          >
                            {item.tab === "centro"
                              ? "⌘"
                              : item.tab === "boardroom"
                              ? "♛"
                              : item.tab === "crisis"
                              ? "!"
                              : item.tab === "clientes"
                              ? "↗"
                              : item.tab === "forecast"
                              ? "◉"
                              : item.tab === "organization"
                              ? "◎"
                              : item.tab === "executive"
                              ? "◆"
                              : item.tab === "pressure"
                              ? "◐"
                              : item.tab === "strategic"
                              ? "△"
                              : item.tab === "intelligence"
                              ? "✦"
                              : item.tab === "integrations"
                              ? "⬡"
                              : item.tab === "whatsapp"
                              ? "☏"
                              : item.tab === "permisos"
                              ? "□"
                              : item.tab === "audit"
                              ? "◌"
                              : item.tab === "legal"
                              ? "§"
                              : "•"}
                          </span>

                          {!sidebarCollapsed && (
                            <span className="min-w-0 flex-1 truncate">{item.texto}</span>
                          )}
                        </span>

                        {!sidebarCollapsed && item.badge && (
                          <span className="ml-2 shrink-0 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] text-gray-300">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 bg-[#05070d]/98 p-2">
          {!sidebarCollapsed && (
            <div className="mb-2 rounded-2xl border border-white/10 bg-black/25 p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[9px] uppercase tracking-[0.22em] text-gray-500">Workspace</p>
                <button
                  type="button"
                  onClick={cargarEmpresasDisponibles}
                  className="text-[9px] font-bold text-cyan-300 hover:text-cyan-100"
                >
                  {cargandoEmpresas ? "..." : "Sync"}
                </button>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <select
                  value={empresaSupabaseId || ""}
                  onChange={(event) => {
                    const selected = empresasDisponibles.find((item) => item.id === event.target.value);
                    if (selected) seleccionarEmpresaWorkspace(selected);
                  }}
                  className="min-w-0 rounded-xl border border-white/10 bg-black px-2 py-2 text-[11px] text-gray-300 outline-none"
                >
                  <option value="">{nombreEmpresa}</option>
                  {empresasDisponibles.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.nombre}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={iniciarNuevoWorkspace}
                  title="Nuevo workspace"
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold text-cyan-200 transition hover:bg-cyan-400/20"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className={`mb-2 grid gap-2 ${sidebarCollapsed ? "grid-cols-1" : "grid-cols-3"}`}>
            <button
              onClick={() => navegarA("boardroom")}
              title="Boardroom"
              className={`flex items-center justify-center gap-2 rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-[11px] font-bold text-yellow-200 transition hover:bg-yellow-400/15 ${
                sidebarCollapsed ? "" : "col-span-1"
              }`}
            >
              <span>♛</span>
              {!sidebarCollapsed && <span className="sr-only">Boardroom</span>}
            </button>

            {!sidebarCollapsed && (
              <>
                <button
                  onClick={descargarPDF}
                  className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  Reporte
                </button>

                <button
                  onClick={descargarPDFIA}
                  className="rounded-xl border border-purple-400/25 bg-purple-400/10 px-3 py-2 text-[11px] font-bold text-purple-100 transition hover:bg-purple-400/20"
                >
                  Brief
                </button>
              </>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-black">
                {(usuario.nombre || "A").slice(0, 1).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-white">
                  {usuario.nombre || "C-Level User"}
                </p>
                <p className="truncate text-[10px] text-gray-500">
                  {usuario.rol} • {usuario.departamento || usuario.cargo || "Dirección"}
                </p>
              </div>

              <button
                onClick={cerrarSesion}
                title="Cerrar sesión"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[12px] text-gray-500 transition hover:bg-white/10 hover:text-white"
              >
                ↩
              </button>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="flex justify-center pb-1 pt-1">
              <button
                onClick={cerrarSesion}
                title="Cerrar sesión"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-xs font-black text-cyan-200 transition hover:scale-105 hover:border-cyan-300/40 hover:bg-cyan-400/15"
              >
                <span className="pointer-events-none absolute left-[3.6rem] top-1/2 z-[120] hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-cyan-400/20 bg-[#07111f]/95 px-3 py-2 text-[11px] font-semibold text-cyan-50 shadow-[0_18px_42px_rgba(2,8,23,0.72)] backdrop-blur-xl group-hover:block">
                  Cerrar sesión
                </span>
                {(usuario.nombre || "A").slice(0, 1).toUpperCase()}
              </button>
            </div>
          )}
        </div>
      </aside>

      <section className={`relative min-h-screen flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.13),transparent_38%),linear-gradient(180deg,#020617,#000000)] ${sidebarCollapsed ? "ml-[5rem]" : "ml-[16.25rem]"}`}>
        <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-[-200px] top-[40%] h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex min-h-screen flex-col p-6 xl:p-8">
          {!puedeVerTab(tabActiva) && (
            <div className="mb-6 rounded-[2rem] border border-red-500/25 bg-red-500/10 p-6">
              <p className="text-sm tracking-[0.3em] text-red-300">ACCESS CONTROL™</p>
              <h2 className="mt-3 text-3xl font-black">Acceso restringido para este rol</h2>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-300">
                Tu rol actual es {usuario.rol}. BNS™ ocultará capas no autorizadas para proteger información ejecutiva, datos de empresa y decisiones C-Level.
              </p>
              <button
                type="button"
                onClick={() => navegarA(tabsPermitidas[0] || "centro")}
                className="mt-5 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/20"
              >
                Ir a mi capa permitida
              </button>
            </div>
          )}

          <div className="sticky top-0 z-40 mb-6 rounded-[1.6rem] border border-cyan-500/15 bg-[#050914]/90 p-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.18)]">
                  ↯
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                      {activeGroup.titulo}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                        predictiveEngine.riesgoPredictivo === "Alto"
                          ? "border-red-500/20 bg-red-500/10 text-red-300"
                          : predictiveEngine.riesgoPredictivo === "Medio"
                          ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                          : "border-green-500/20 bg-green-500/10 text-green-300"
                      }`}
                    >
                      {predictiveEngine.riesgoPredictivo === "Alto"
                        ? "Critical Signal"
                        : predictiveEngine.riesgoPredictivo === "Medio"
                        ? "Watch Signal"
                        : "Stable Signal"}
                    </span>
                  </div>

                  <h1 className="mt-2 truncate text-lg font-black tracking-tight xl:text-3xl">
                    {pageContext[tabActiva]?.title || tituloSeccion[tabActiva]}
                  </h1>
                  <p className="mt-1 max-w-4xl truncate text-xs leading-5 text-gray-500 xl:text-sm">
                    {pageContext[tabActiva]?.description || activeSubtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs xl:flex xl:items-center xl:gap-3">
                <div className="rounded-2xl border border-cyan-500/15 bg-black/35 px-4 py-3">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-gray-500">BNS</p>
                  <p className="mt-1 text-lg font-black text-cyan-300">{bnsMetrics.bnsScore}</p>
                </div>

                <div className="rounded-2xl border border-green-500/15 bg-black/35 px-4 py-3">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-gray-500">Revenue Forecast</p>
                  <p className="mt-1 text-lg font-black text-green-300">{safePercent(forecastIntelligence.confianza)}%</p>
                </div>

                <div className="rounded-2xl border border-yellow-500/15 bg-black/35 px-4 py-3">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-gray-500">Pressure</p>
                  <p
                    className={`mt-1 text-lg font-black ${
                      pressureEngine.promedio >= 70
                        ? "text-red-300"
                        : pressureEngine.promedio >= 50
                        ? "text-yellow-300"
                        : "text-green-300"
                    }`}
                  >
                    {safePercent(pressureEngine.promedio)}%
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-500/15 bg-black/35 px-4 py-3">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-gray-500">Pulse</p>
                  <p className="mt-1 truncate text-sm font-bold text-purple-300">
                    {tiempoRealActivo ? "Live" : "Standby"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                  Empresa: <span className="text-gray-300">{nombreEmpresa}</span>
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                  Último pulso: <span className="text-cyan-300">{ultimoPulsoTiempoReal}</span>
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                  Live Feed: <span className="text-green-300">{liveEvents.length}</span>
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                  Groq: <span className="text-purple-300">{groqGenerando ? "Analizando" : "Listo"}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navegarA("intelligence")}
                  className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  Executive Intelligence
                </button>
                <button
                  onClick={() => navegarA("boardroom")}
                  className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-xs font-bold text-yellow-100 transition hover:bg-yellow-400/20"
                >
                  Boardroom
                </button>
                <button
                  onClick={() => navegarA("importador")}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold text-gray-300 transition hover:bg-white/10 hover:text-white"
                >
                  Sources
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              {pageContext[tabActiva]?.title || "BNS™"}
            </p>
            <p className="mt-2 max-w-5xl text-sm leading-6 text-gray-400">
              {pageContext[tabActiva]?.description || "Capa ejecutiva de interpretación empresarial."}
            </p>
          </div>

          {tabActiva === "cuenta" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-6">
                <p className="text-sm tracking-[0.3em] text-cyan-300">
                  CUENTA ACTIVA
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  {usuario.nombre || "Usuario sin nombre"}
                </h2>

                <p className="mt-3 text-sm text-gray-400">{usuario.email}</p>
                <p className="mt-2 text-sm text-gray-400">
                  Puesto específico: {usuario.cargo || "No registrado"}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Departamento: {usuario.departamento}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Teléfono: {usuario.telefono || "No registrado"}
                </p>
                <p className="mt-2 text-sm text-cyan-300">Rol de acceso: {usuario.rol}</p>
              </div>

              <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
                <p className="text-sm tracking-[0.3em] text-yellow-300">
                  SEGURIDAD
                </p>

                <h2 className="mt-4 text-2xl font-bold">
                  Acceso pendiente de Supabase Auth
                </h2>

                <p className="mt-4 text-sm leading-6 text-gray-300">
                  Esta pantalla ya simula usuario y contraseña. El siguiente
                  paso técnico es conectar Supabase Auth para que el acceso sea
                  real, seguro y persistente.
                </p>
              </div>
            </div>
          )}

          {tabActiva === "entrada" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl">
                <p className="text-sm tracking-[0.3em] text-cyan-300">
                  PUERTA DE ENTRADA BNS™
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Registra la empresa antes de analizarla
                </h2>

                <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-400">
                  Esta sección define qué empresa está siendo analizada. Sin
                  este registro, las métricas solo son demostrativas. Después
                  estos datos se guardarán en Supabase.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <input
                  value={empresa.nombre}
                  onChange={(event) =>
                    actualizarEmpresa("nombre", event.target.value)
                  }
                  placeholder="Nombre de la empresa"
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                />

                <input
                  value={empresa.giro}
                  onChange={(event) =>
                    actualizarEmpresa("giro", event.target.value)
                  }
                  placeholder="Giro o industria"
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                />

                <input
                  value={empresa.sitio}
                  onChange={(event) =>
                    actualizarEmpresa("sitio", event.target.value)
                  }
                  placeholder="Sitio web"
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                />

                <input
                  value={empresa.whatsapp}
                  onChange={(event) =>
                    actualizarEmpresa("whatsapp", event.target.value)
                  }
                  placeholder="WhatsApp empresarial"
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                />

                <input
                  value={empresa.instagram}
                  onChange={(event) =>
                    actualizarEmpresa("instagram", event.target.value)
                  }
                  placeholder="Instagram"
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                />

                <input
                  value={empresa.facebook}
                  onChange={(event) =>
                    actualizarEmpresa("facebook", event.target.value)
                  }
                  placeholder="Facebook"
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                />

                <input
                  value={empresa.tamano}
                  onChange={(event) =>
                    actualizarEmpresa("tamano", event.target.value)
                  }
                  placeholder="Número aproximado de empleados"
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                />

                <input
                  value={empresa.responsable}
                  onChange={(event) =>
                    actualizarEmpresa("responsable", event.target.value)
                  }
                  placeholder="Responsable interno"
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                />
              </div>

              <textarea
                value={empresa.objetivo}
                onChange={(event) => actualizarEmpresa("objetivo", event.target.value)}
                placeholder="Objetivo principal: vender más, mejorar soporte, detectar crisis, ordenar operación, etc."
                className="min-h-32 w-full rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
              />

              <button
                onClick={registrarEmpresa}
                className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-8 py-4 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/25"
              >
                Iniciar Centro Neural
              </button>
            </div>
          )}

          {tabActiva === "permisos" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-6">
                <p className="text-sm tracking-[0.3em] text-cyan-300">
                  MIEMBROS Y PERMISOS
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  Acceso compartido por empresa
                </h2>

                <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-400">
                  Una empresa puede tener varios usuarios. Cada usuario tendrá
                  un rol y solo podrá acceder a empresas donde esté autorizado.
                  En Supabase esto se protegerá con RLS.
                </p>

                <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-300">
                  Plan actual: {planActual} • Usuarios: {usuariosUsados}/
                  {limiteUsuarios}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                <input
                  value={nuevoMiembro.nombre}
                  onChange={(event) =>
                    actualizarNuevoMiembro("nombre", event.target.value)
                  }
                  placeholder="Nombre del miembro"
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                />

                <input
                  value={nuevoMiembro.email}
                  onChange={(event) =>
                    actualizarNuevoMiembro("email", event.target.value)
                  }
                  placeholder="Email"
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                />

                <select
                  value={nuevoMiembro.rol}
                  onChange={(event) =>
                    actualizarNuevoMiembro("rol", event.target.value)
                  }
                  className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none"
                >
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Analyst</option>
                  <option>Viewer</option>
                </select>

                <button
                  onClick={agregarMiembro}
                  className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-5 py-4 text-sm font-bold text-cyan-200"
                >
                  Invitar
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
                  <p className="text-sm font-bold text-green-300">Owner</p>
                  <p className="mt-2 text-sm text-gray-300">
                    Control total, pagos, conexiones, permisos y eliminación de empresa.
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                  <p className="text-sm font-bold text-cyan-300">
                    Admin
                  </p>
                  <p className="mt-2 text-sm text-gray-300">
                    Administra usuarios, fuentes, configuración y reportes.
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                  <p className="text-sm font-bold text-yellow-300">
                    Manager
                  </p>
                  <p className="mt-2 text-sm text-gray-300">
                    Opera módulos de su área, revisa tableros y ejecuta acciones autorizadas.
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
                  <p className="text-sm font-bold text-purple-300">Analyst</p>
                  <p className="mt-2 text-sm text-gray-300">
                    Puede analizar, revisar datos y generar reportes, sin administrar usuarios.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 xl:col-span-2">
                  <p className="text-sm font-bold text-gray-200">Viewer / Espectador</p>
                  <p className="mt-2 text-sm text-gray-300">
                    Solo lectura. Debe ser aprobado por Owner, Dirección General o usuario autorizado registrado dentro de la empresa.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    nombre: usuario.nombre || usuario.email,
                    email: usuario.email,
                    rol: usuario.rol,
                    estado: "Activo",
                  },
                  ...miembros,
                ].map((miembro) => (
                  <div
                    key={`${miembro.email}-${miembro.rol}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="text-sm font-bold">{miembro.nombre}</p>
                      <p className="text-xs text-gray-500">{miembro.email}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-cyan-300">{miembro.rol}</p>
                      <p className="text-xs text-gray-500">{miembro.estado}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabActiva === "audit" && (
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-cyan-300">ENTERPRISE AUDIT TRAIL™</p>
                    <h2 className="mt-3 text-4xl font-bold">Bitácora ejecutiva del sistema</h2>
                    <p className="mt-4 max-w-5xl text-sm leading-6 text-gray-400">
                      Registro de acciones críticas: IA, PDF, importaciones, navegación protegida, seguridad y actividad de gobierno.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5">
                    <p className="text-xs tracking-[0.25em] text-purple-300">EVENTOS</p>
                    <h3 className="mt-2 text-3xl font-black text-purple-200">{auditTrail.length}</h3>
                    <p className="mt-2 text-sm text-gray-400">Últimos 120 movimientos</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                {[
                  ["Alta", auditTrail.filter((evento) => evento.severidad === "Alta").length, "text-red-300 border-red-500/20 bg-red-500/10"],
                  ["Media", auditTrail.filter((evento) => evento.severidad === "Media").length, "text-yellow-300 border-yellow-500/20 bg-yellow-500/10"],
                  ["Baja", auditTrail.filter((evento) => evento.severidad === "Baja").length, "text-green-300 border-green-500/20 bg-green-500/10"],
                  ["Seguridad", auditTrail.filter((evento) => evento.tipo === "Seguridad").length, "text-cyan-300 border-cyan-500/20 bg-cyan-500/10"],
                ].map(([label, value, style]) => (
                  <div key={label as string} className={`rounded-3xl border p-5 ${style as string}`}>
                    <p className="text-xs tracking-[0.25em]">{label as string}</p>
                    <h3 className="mt-2 text-3xl font-black">{value as number}</h3>
                  </div>
                ))}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-cyan-300">ACTIVIDAD</p>
                    <h3 className="mt-2 text-2xl font-bold">Eventos recientes</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAuditTrail([]);
                      registrarAuditoria("Gobernanza", "Audit Trail reiniciado", "La bitácora fue limpiada por un usuario autorizado.", "Media");
                    }}
                    className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Limpiar bitácora
                  </button>
                </div>

                {auditTrail.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-sm leading-7 text-gray-400">
                    Aún no hay eventos registrados. Genera un PDF, importa CSV, ejecuta Groq o navega entre capas para activar la bitácora.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditTrail.map((evento) => (
                      <div
                        key={evento.id}
                        className={`rounded-3xl border p-5 ${
                          evento.severidad === "Alta"
                            ? "border-red-500/20 bg-red-500/10"
                            : evento.severidad === "Media"
                            ? "border-yellow-500/20 bg-yellow-500/10"
                            : "border-white/10 bg-black/30"
                        }`}
                      >
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                                {evento.tipo}
                              </span>
                              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                                {evento.severidad}
                              </span>
                            </div>

                            <h4 className="mt-3 text-xl font-bold text-white">{evento.accion}</h4>
                            <p className="mt-2 text-sm leading-6 text-gray-300">{evento.descripcion}</p>
                          </div>

                          <div className="min-w-[190px] rounded-2xl border border-white/10 bg-black/30 p-4 text-right">
                            <p className="text-xs text-gray-500">{evento.hora}</p>
                            <p className="mt-2 text-sm font-bold text-white">{evento.usuario}</p>
                            <p className="text-xs text-cyan-300">{evento.rol}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tabActiva === "legal" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8">
                <p className="text-sm tracking-[0.3em] text-cyan-300">
                  LEGAL CENTER
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Privacidad, tratamiento de datos y permisos
                </h2>

                <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-400">
                  Esta sección hace visibles las reglas de uso antes de conectar datos reales. El texto final deberá revisarse legalmente antes de producción.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {Object.values(documentosLegales).map((documento) => (
                  <button
                    key={documento.titulo}
                    onClick={() => abrirDocumentoLegal(documento)}
                    className="rounded-3xl border border-cyan-500/20 bg-white/5 p-6 text-left transition hover:border-cyan-400/50 hover:bg-cyan-500/10"
                  >
                    <p className="text-sm text-cyan-300">DOCUMENTO</p>
                    <h3 className="mt-3 text-2xl font-bold">{documento.titulo}</h3>
                    <p className="mt-4 text-sm leading-6 text-gray-400">
                      {documento.descripcion}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tabActiva === "centro" && (
            <>
              <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_0.45fr]">
                <div className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[radial-gradient(circle_at_80%_35%,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.018))] p-6 backdrop-blur-xl">
                  <div className="absolute right-10 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full border border-cyan-300/15" />
                  <div className="absolute right-16 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-cyan-300/20" />
                  <div className="absolute right-24 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full border border-cyan-300/30 bg-cyan-400/10 shadow-[0_0_50px_rgba(34,211,238,0.22)]" />

                  <div className="relative z-10">
                    <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-200">
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
                      EXECUTIVE SITUATION ROOM™
                    </div>

                    <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-[-0.04em] xl:text-4xl">
                      BNS detecta presión moderada en Revenue y Coordinación Operativa.
                    </h2>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400">
                      Riesgos controlados. Sistema estable. Requiere foco ejecutivo en seguimiento comercial,
                      velocidad de respuesta y alineación entre áreas críticas.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                      {[
                        ["AI Confidence", `${safePercent(forecastIntelligence.confianza)}%`, "text-cyan-300", "border-cyan-500/20 bg-cyan-500/10"],
                        ["Active Risks", `${Math.max(3, signalEventEngine.length || 0)}`, "text-red-300", "border-red-500/20 bg-red-500/10"],
                        ["Executive Priority", "Revenue & Ops", "text-yellow-300", "border-yellow-500/20 bg-yellow-500/10"],
                        ["Next Review", "Hoy, 6:00 p.m.", "text-sky-300", "border-sky-500/20 bg-sky-500/10"],
                      ].map(([label, value, color, cls]) => (
                        <button
                          key={label}
                          onClick={() =>
                            abrirDetalle({
                              titulo: label,
                              valor: value,
                              descripcion: "Indicador ejecutivo del Command Center™ para priorizar intervención y lectura directiva.",
                              fuente: "Executive Situation Room™",
                              accion: "Revisar este indicador dentro de la reunión ejecutiva y asignar responsable si requiere acción.",
                            })
                          }
                          className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/35 ${cls}`}
                        >
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/38">{label}</p>
                          <p className={`mt-2 text-xl font-black ${color}`}>{value}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[2rem] border border-purple-500/20 bg-[radial-gradient(circle_at_85%_35%,rgba(168,85,247,0.20),transparent_34%),linear-gradient(135deg,rgba(168,85,247,0.10),rgba(34,211,238,0.035))] p-6">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-purple-200">
                        Executive Recommendation
                      </p>
                      <h3 className="mt-4 text-2xl font-black leading-tight">
                        Enfocar seguimiento comercial, mejorar velocidad de respuesta y alinear áreas críticas.
                      </h3>
                      <button
                        onClick={() =>
                          abrirDetalle({
                            titulo: "Executive Recommendation™",
                            valor: "Priorizar seguimiento comercial",
                            descripcion: "BNS™ recomienda resolver fricción comercial antes de aumentar demanda para evitar saturación y pérdida de oportunidades.",
                            fuente: "Executive Intelligence Layer™",
                            accion: "Asignar responsable comercial, revisar leads calientes y establecer cadencia semanal de forecast.",
                          })
                        }
                        className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-400/20"
                      >
                        Ver recomendación completa →
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        abrirDetalle({
                          titulo: "BNS Index™",
                          valor: `${bnsMetrics.bnsScore}/100`,
                          descripcion: "Índice ejecutivo de salud empresarial basado en presión, forecast, riesgo, operación y señales.",
                          fuente: "BNS™ Core",
                          accion: "Usar como métrica central para priorizar intervención directiva.",
                        })
                      }
                      className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 shadow-[0_0_60px_rgba(52,211,153,0.18)] transition hover:scale-105"
                    >
                      <div className="absolute inset-3 rounded-full border border-emerald-300/25" />
                      <div className="text-center">
                        <p className="text-4xl font-black text-white">{bnsMetrics.bnsScore}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">BNS Index</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-4">
                {[
                  {
                    title: "ORGANIZATIONAL ACCESS™",
                    subtitle: "Control de acceso, sesión y gobierno ejecutivo.",
                    value: "Conectado",
                    delta: "OK",
                    tone: "success",
                    footer: "Access Intelligence",
                    icon: "◈",
                    pulseLabel: "ACCESS PULSE",
                    state: "active",
                    color: "teal",
                    detailAction: "Validar sesión, roles y gobierno de acceso antes de escalar usuarios.",
                  },
                  {
                    title: "BUSINESS MEMORY™",
                    subtitle: "Persistencia, seguridad y estructura de datos.",
                    value: "Conectado",
                    delta: "LIVE",
                    tone: "intelligence",
                    footer: "Data Infrastructure",
                    icon: "⬡",
                    pulseLabel: "MEMORY PULSE",
                    state: "stable",
                    color: "cyan",
                    detailAction: "Consolidar workspaces, empresas, señales y acciones para memoria histórica real.",
                  },
                  {
                    title: "EXECUTIVE INTELLIGENCE™",
                    subtitle: "IA ejecutiva interpretando señales en tiempo real.",
                    value: groqGenerando ? "Analizando" : "Lista",
                    delta: groqGenerando ? "AI ACTIVE" : "READY",
                    tone: "prediction",
                    footer: "AI Decision Layer",
                    icon: "✦",
                    pulseLabel: "AI PULSE",
                    state: "reactive",
                    color: "purple",
                    detailAction: "Usar briefing IA para priorizar decisiones, forecast y acciones ejecutivas.",
                  },
                  {
                    title: "SIGNAL NETWORK™",
                    subtitle: "WhatsApp / CRM / Webhooks pendientes.",
                    value: "0 activas",
                    delta: "SETUP",
                    tone: "executive",
                    footer: "Fuentes externas por conectar",
                    icon: "◎",
                    pulseLabel: "SIGNAL IDLE HEARTBEAT",
                    state: "idle",
                    color: "amber",
                    detailAction: "Conectar WhatsApp, CRM, webhooks, formularios y fuentes externas para activar señales vivas.",
                  },
                ].map((item) => {
                  const theme = getExecutiveCardTone(item.tone as ExecutiveCardTone);
                  const safeId = item.title.replace(/[^a-zA-Z0-9]/g, "");
                  const isIdle = item.state === "idle";
                  const isStable = item.state === "stable";
                  const isReactive = item.state === "reactive";
                  const isActive = item.state === "active";

                  const pulsePath =
                    isIdle
                      ? "M0 48 L54 48 L66 48 L73 42 L80 54 L88 48 L160 48 L174 48 L181 44 L188 52 L196 48 L360 48"
                      : isStable
                        ? "M0 48 L45 48 L55 48 L62 26 L72 68 L84 48 L142 48 L154 48 L164 32 L174 60 L186 48 L242 48 L256 48 L267 28 L278 64 L292 48 L360 48"
                        : isReactive
                          ? "M0 48 L32 48 L46 48 L56 18 L68 72 L82 48 L112 48 L128 48 L139 30 L152 65 L166 48 L205 48 L222 48 L235 16 L250 74 L266 48 L305 48 L320 48 L332 34 L344 60 L360 48"
                          : "M0 48 L42 48 L55 48 L63 24 L72 66 L82 48 L122 48 L138 48 L146 34 L155 58 L164 48 L222 48 L238 48 L247 20 L258 70 L270 48 L360 48";

                  const gradientStops =
                    item.color === "amber"
                      ? ["rgba(250,204,21,0.12)", "rgba(250,204,21,0.76)", "rgba(250,204,21,0.24)"]
                      : item.color === "purple"
                        ? ["rgba(216,180,254,0.10)", "rgba(168,85,247,0.84)", "rgba(216,180,254,0.22)"]
                        : item.color === "teal"
                          ? ["rgba(45,212,191,0.10)", "rgba(45,212,191,0.74)", "rgba(45,212,191,0.22)"]
                          : ["rgba(34,211,238,0.10)", "rgba(34,211,238,0.78)", "rgba(34,211,238,0.23)"];

                  const strokeColor =
                    item.color === "amber"
                      ? "rgba(250,204,21,0.70)"
                      : item.color === "purple"
                        ? "rgba(168,85,247,0.74)"
                        : item.color === "teal"
                          ? "rgba(45,212,191,0.72)"
                          : "rgba(34,211,238,0.72)";

                  const glowClass =
                    item.color === "amber"
                      ? "via-yellow-400/[0.075]"
                      : item.color === "purple"
                        ? "via-purple-400/[0.065]"
                        : item.color === "teal"
                          ? "via-teal-400/[0.065]"
                          : "via-cyan-400/[0.065]";

                  const dotClass =
                    item.color === "amber"
                      ? "bg-yellow-300"
                      : item.color === "purple"
                        ? "bg-purple-300"
                        : item.color === "teal"
                          ? "bg-teal-300"
                          : "bg-cyan-300";

                  const animationClass =
                    isIdle
                      ? "animate-[bnsIdleHeartbeat_4.8s_linear_infinite]"
                      : isStable
                        ? "animate-[bnsEcgPulse_3.25s_linear_infinite]"
                        : isReactive
                          ? "animate-[bnsReactivePulse_2.45s_linear_infinite]"
                          : "animate-[bnsEcgPulse_3s_linear_infinite]";

                  const animationStyle =
                    isIdle
                      ? { strokeDasharray: 500, strokeDashoffset: 500 }
                      : { strokeDasharray: 420, strokeDashoffset: 420 };

                  return (
                    <button
                      key={item.title}
                      onClick={() =>
                        abrirDetalle({
                          titulo: item.title,
                          valor: item.value,
                          descripcion: item.subtitle,
                          fuente: item.footer,
                          accion: item.detailAction,
                        })
                      }
                      className={`group relative min-h-[330px] overflow-hidden rounded-[28px] border bg-[#05070d]/95 p-5 text-left backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.01] ${theme.border} ${theme.glow}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-100 ${theme.bg}`} />
                      <div className="absolute inset-[1px] rounded-[27px] border border-white/[0.03]" />
                      <div className={`absolute inset-x-6 bottom-7 h-20 bg-gradient-to-r from-transparent ${glowClass} to-transparent blur-2xl opacity-70`} />
                      <div className="absolute left-5 right-5 top-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

                      <div className="relative z-10 flex h-full flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${dotClass} shadow-[0_0_16px_currentColor] ${isIdle ? "animate-[bnsStandbyLight_2.4s_ease-in-out_infinite]" : ""}`} />
                              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/38">{item.title}</p>
                            </div>
                            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-400">{item.subtitle}</p>
                          </div>

                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.03] text-lg transition-all duration-300 group-hover:scale-105 ${theme.icon}`}>
                            {item.icon}
                          </div>
                        </div>

                        <div className="mt-8">
                          <div className="flex flex-wrap items-end gap-3">
                            <h2 className="text-[34px] font-black leading-none tracking-[-0.05em] text-white">{item.value}</h2>
                            <span className={`mb-1 rounded-full border px-3 py-1 text-[10px] font-bold ${theme.badge}`}>{item.delta}</span>
                          </div>
                          <p className="mt-3 text-sm text-white/55">{item.footer}</p>
                        </div>

                        <div className="relative mt-7 h-20 overflow-hidden rounded-2xl border border-white/[0.04] bg-black/25">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_50%,rgba(34,211,238,0.095),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent)]" />
                          <div className="absolute inset-x-5 top-1/2 h-px bg-white/[0.08]" />
                          <div className={`absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 bg-gradient-to-r from-transparent ${glowClass} to-transparent`} />

                          <svg viewBox="0 0 360 88" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id={`bns-card-vital-${safeId}`} x1="0%" x2="100%" y1="0%" y2="0%">
                                <stop offset="0%" stopColor={gradientStops[0]} />
                                <stop offset="46%" stopColor={gradientStops[1]} />
                                <stop offset="100%" stopColor={gradientStops[2]} />
                              </linearGradient>
                              <filter id={`bns-card-vital-glow-${safeId}`}>
                                <feGaussianBlur stdDeviation={isIdle ? "1.9" : "2.9"} result="coloredBlur" />
                                <feMerge>
                                  <feMergeNode in="coloredBlur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>

                            <path
                              d={pulsePath}
                              fill="none"
                              stroke={isIdle ? strokeColor : `url(#bns-card-vital-${safeId})`}
                              strokeWidth={isIdle ? 2.2 : isReactive ? 3.15 : 2.9}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              filter={`url(#bns-card-vital-glow-${safeId})`}
                              className={animationClass}
                              style={animationStyle}
                            />

                            <circle r={isIdle ? "2.9" : "3.4"} fill={strokeColor}>
                              <animateMotion
                                dur={isIdle ? "4.8s" : isStable ? "3.25s" : isReactive ? "2.45s" : "3s"}
                                repeatCount="indefinite"
                                path={pulsePath}
                              />
                            </circle>
                          </svg>

                          <div className="absolute left-4 top-3 flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${dotClass} shadow-[0_0_12px_currentColor] ${isIdle ? "animate-[bnsStandbyLight_2.4s_ease-in-out_infinite]" : ""}`} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.19em] text-white/42">{item.pulseLabel}</span>
                          </div>

                          <div className="absolute bottom-3 right-4 rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold text-white/48">
                            {item.delta}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mb-6 space-y-5">
                <div className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[radial-gradient(circle_at_22%_10%,rgba(34,211,238,0.14),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] p-5 backdrop-blur-xl shadow-[0_0_70px_rgba(34,211,238,0.055)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.10),transparent_28%),radial-gradient(circle_at_80%_86%,rgba(34,211,238,0.08),transparent_32%)]" />

                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-cyan-300">Executive Intelligence Matrix™</p>
                      <p className="mt-1 text-xs text-gray-500">Lectura ejecutiva por área, presión y prioridad</p>
                    </div>
                    <button
                      onClick={() =>
                        abrirDetalle({
                          titulo: "Executive Intelligence Matrix™",
                          valor: "7 áreas",
                          descripcion: "Matriz horizontal ejecutiva con score, presión, estado, prioridad y tendencia.",
                          fuente: "Command Center™ • Executive Matrix",
                          accion: "Priorizar Soporte y Revenue antes de aumentar demanda.",
                        })
                      }
                      className="hidden rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200 transition hover:bg-cyan-500/20 md:block"
                    >
                      Abrir matriz
                    </button>
                  </div>

                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/45 p-4">
                    <div className="absolute inset-0 opacity-14 [background-image:linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] [background-size:38px_38px]" />
                    <div className="absolute right-[-90px] top-[-90px] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
                    <div className="absolute bottom-[-120px] left-[-90px] h-80 w-80 rounded-full bg-purple-400/10 blur-3xl" />

                    <div className="relative z-10 space-y-3.5">
                      <div className="overflow-hidden rounded-3xl border border-cyan-500/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.06),rgba(168,85,247,0.04),rgba(250,204,21,0.06))] p-4 backdrop-blur-xl">
                        <div className="grid gap-4 xl:grid-cols-[1.68fr_0.5fr]">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">
                              AI Executive Readout
                            </p>

                            <h3 className="mt-3 max-w-4xl text-[24px] font-black leading-[1.06] tracking-[-0.04em] text-white">
                              Revenue y Soporte requieren{" "}
                              <span className="text-cyan-300">atención inmediata</span>{" "}
                              antes de aumentar demanda.
                            </h3>

                            <p className="mt-4 max-w-3xl text-[12px] leading-6 text-gray-400">
                              El núcleo BNS™ detecta estabilidad operativa general,
                              pero identifica fricción comercial en forecast,
                              seguimiento de oportunidades y tiempos de respuesta.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <div className="rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[10px] font-semibold text-red-300">
                                Forecast inestable
                              </div>

                              <div className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1 text-[10px] font-semibold text-yellow-300">
                                Seguimiento irregular
                              </div>

                              <div className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold text-cyan-300">
                                Latencia de soporte
                              </div>
                            </div>
                          </div>

                          <div className="relative overflow-hidden rounded-[1.7rem] border border-yellow-500/20 bg-[linear-gradient(180deg,rgba(250,204,21,0.12),rgba(250,204,21,0.04))] p-4">
                            <div className="absolute right-[-48px] top-[-48px] h-32 w-32 rounded-full bg-yellow-400/10 blur-3xl" />

                            <p className="relative text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-300">
                              Nivel de intervención
                            </p>

                            <p className="relative mt-3 text-[40px] font-black leading-none text-yellow-300">
                              Alta
                            </p>

                            <p className="relative mt-2 text-sm font-semibold text-yellow-100">
                              Revenue + Soporte
                            </p>

                            <div className="relative mt-5 space-y-3 text-[10px] leading-5 text-yellow-100/70">
                              <div>
                                <span className="block uppercase tracking-[0.18em] text-yellow-300/70">
                                  Ventana recomendada
                                </span>
                                48 horas antes de afectación comercial.
                              </div>

                              <div>
                                <span className="block uppercase tracking-[0.18em] text-yellow-300/70">
                                  Impacto potencial
                                </span>
                                Conversión y experiencia del cliente.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                        <div className="grid grid-cols-[1.35fr_0.55fr_1.15fr_0.9fr_0.85fr] border-b border-white/10 px-5 py-3 text-[8px] font-bold uppercase tracking-[0.16em] text-white/38">
                          <span>Área</span>
                          <span className="text-right">Score</span>
                          <span className="pl-2">Presión</span>
                          <span className="pl-2">Estado</span>
                          <span className="pl-2">Prioridad</span>
                        </div>

                        {[
                          {
                            area: "Operación",
                            score: 80,
                            pressure: 28,
                            state: "Estable",
                            priority: "Baja",
                            color: "text-green-300",
                            bar: "bg-green-400",
                            badge: "border-green-500/20 bg-green-500/10 text-green-300",
                            icon: "⚙",
                          },
                          {
                            area: "Revenue",
                            score: 60,
                            pressure: 64,
                            state: "Atención",
                            priority: "Media",
                            color: "text-yellow-300",
                            bar: "bg-yellow-400",
                            badge: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
                            icon: "$",
                          },
                          {
                            area: "Soporte",
                            score: 42,
                            pressure: 78,
                            state: "Crítica",
                            priority: "Alta",
                            color: "text-red-300",
                            bar: "bg-red-400",
                            badge: "border-red-500/20 bg-red-500/10 text-red-300",
                            icon: "!",
                          },
                          {
                            area: "Digital",
                            score: 64,
                            pressure: 48,
                            state: "Medios",
                            priority: "Media",
                            color: "text-purple-300",
                            bar: "bg-purple-400",
                            badge: "border-purple-500/20 bg-purple-500/10 text-purple-300",
                            icon: "◇",
                          },
                          {
                            area: "Marketing",
                            score: 81,
                            pressure: 34,
                            state: "Impulso",
                            priority: "Baja",
                            color: "text-emerald-300",
                            bar: "bg-emerald-400",
                            badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                            icon: "↗",
                          },
                          {
                            area: "Liderazgo",
                            score: 72,
                            pressure: 44,
                            state: "Vigilante",
                            priority: "Media",
                            color: "text-sky-300",
                            bar: "bg-sky-400",
                            badge: "border-sky-500/20 bg-sky-500/10 text-sky-300",
                            icon: "♙",
                          },
                          {
                            area: "Procesos",
                            score: 68,
                            pressure: 52,
                            state: "Alinear",
                            priority: "Media",
                            color: "text-cyan-300",
                            bar: "bg-cyan-400",
                            badge: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
                            icon: "⌬",
                          },
                        ].map((row) => (
                          <button
                            key={row.area}
                            onClick={() =>
                              abrirDetalle({
                                titulo: `Matriz ${row.area}`,
                                valor: `${row.score}`,
                                descripcion: `${row.area}: score ${row.score}, presión ${row.pressure}/100, estado ${row.state}, prioridad ${row.priority}.`,
                                fuente: "Executive Intelligence Matrix™",
                                accion: "Revisar este indicador y definir acción ejecutiva si la presión supera el umbral.",
                              })
                            }
                            className="group grid w-full grid-cols-[1.35fr_0.55fr_1.15fr_0.9fr_0.85fr] items-center gap-4 border-b border-white/[0.06] px-5 py-3 text-left transition last:border-b-0 hover:bg-cyan-500/10"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-sm font-black ${row.color}`}>
                                {row.icon}
                              </span>
                              <span className="text-[13px] font-bold text-white">{row.area}</span>
                            </div>

                            <span className={`text-right text-2xl font-black leading-none ${row.color}`}>{row.score}</span>

                            <div className="min-w-0">
                              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div className={`h-full rounded-full ${row.bar} shadow-[0_0_14px_currentColor]`} style={{ width: `${row.pressure}%` }} />
                              </div>
                              <p className="mt-1 text-[9px] text-white/35">{row.pressure} / 100</p>
                            </div>

                            <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold ${row.badge}`}>
                              {row.state}
                            </span>

                            <span className={`text-xs font-bold ${row.color}`}>{row.priority}</span>
                          </button>
                        ))}
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                        <div className="grid grid-cols-3 divide-x divide-white/10">
                          {[
                            ["BNS Core™", `${bnsMetrics.bnsScore}`, "+7 pts", "text-cyan-300"],
                            ["Áreas críticas", "2", "Soporte · Revenue", "text-red-300"],
                            ["Acción sugerida", "48h", "Ventana óptima", "text-yellow-300"],
                          ].map(([label, value, sub, color]) => (
                            <button
                              key={label}
                              onClick={() =>
                                abrirDetalle({
                                  titulo: label,
                                  valor: value,
                                  descripcion: sub,
                                  fuente: "Executive Intelligence Matrix™",
                                  accion: "Usarlo como punto de control para la siguiente revisión ejecutiva.",
                                })
                              }
                              className="p-2.5 text-left transition hover:bg-cyan-500/10"
                            >
                              <p className="text-[8.5px] uppercase tracking-[0.18em] text-white/35">{label}</p>
                              <div className="mt-2 flex items-end justify-between gap-2">
                                <p className={`text-2xl font-black leading-none ${color}`}>{value}</p>
                                <p className="truncate text-[9.5px] text-white/40">{sub}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.18fr_0.82fr]">
                <div className="rounded-[2rem] border border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.035),rgba(255,255,255,0.014))] p-5 backdrop-blur-xl shadow-[0_0_70px_rgba(34,211,238,0.06)]">
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-black uppercase tracking-[0.24em] text-cyan-300">Executive Pulse Engine™</p>
                      <p className="mt-1 text-sm text-gray-500">Telemetría ejecutiva de comportamiento organizacional.</p>
                    </div>

                    <button
                      onClick={() =>
                        abrirDetalle({
                          titulo: "Executive Pulse Engine™",
                          valor: "72 / Riesgo medio",
                          descripcion: "Motor de telemetría ejecutiva interpretando presión, revenue, sincronía y fricción organizacional.",
                          fuente: "BNS™ Pulse Engine",
                          accion: "Detectar anomalías antes de afectar revenue o experiencia.",
                        })
                      }
                      className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-500/20"
                    >
                      Analizar
                    </button>
                  </div>

                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-6">
                    <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:54px_42px]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.08),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.08),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.06),transparent_32%)]" />

                    <div className="relative mb-6 flex flex-wrap items-center justify-between gap-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">BNS™ live telemetry</p>

                        <div className="mt-2 flex items-end gap-3">
                          <span className="text-5xl font-black text-white">72</span>
                          <div className="pb-2">
                            <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-yellow-300">
                              Riesgo medio
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-white/40">
                        <span className="flex items-center gap-2">
                          <i className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                          Revenue
                        </span>

                        <span className="flex items-center gap-2">
                          <i className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                          Ops
                        </span>

                        <span className="flex items-center gap-2">
                          <i className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.9)]" />
                          Digital
                        </span>

                        <span className="flex items-center gap-2">
                          <i className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.9)]" />
                          Support
                        </span>
                      </div>
                    </div>

                    <div className="relative h-[430px] overflow-hidden rounded-[1.5rem] border border-white/5 bg-black/20">
                      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[25%] bg-gradient-to-b from-red-500/14 via-red-500/7 to-transparent" />
                      <div className="pointer-events-none absolute left-0 right-0 top-[38%] h-[24%] bg-gradient-to-b from-yellow-500/12 via-yellow-500/6 to-transparent" />
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[26%] bg-gradient-to-t from-emerald-500/10 via-cyan-500/5 to-transparent" />

                      <div className="absolute left-4 top-[8%] rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-red-300 backdrop-blur-md">
                        risk zone
                      </div>

                      <div className="absolute right-4 top-[42%] rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-yellow-300 backdrop-blur-md">
                        pressure band
                      </div>

                      <div className="absolute left-4 bottom-[8%] rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300 backdrop-blur-md">
                        stable flow
                      </div>

                      <svg viewBox="0 0 1000 430" className="absolute inset-0 h-full w-full" fill="none">
                        <path
                          d="M0 320 L90 280 L180 300 L270 220 L360 245 L450 170 L540 255 L630 210 L720 135 L810 185 L900 95 L1000 130"
                          stroke="#34d399"
                          strokeWidth="5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_18px_rgba(52,211,153,0.95)]"
                        />

                        <path
                          d="M0 360 L90 330 L180 280 L270 285 L360 230 L450 240 L540 185 L630 210 L720 195 L810 165 L900 172 L1000 150"
                          stroke="#22d3ee"
                          strokeWidth="5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_18px_rgba(34,211,238,0.95)]"
                        />

                        <path
                          d="M0 250 L90 210 L180 225 L270 265 L360 205 L450 175 L540 205 L630 245 L720 180 L810 145 L900 110 L1000 82"
                          stroke="#c084fc"
                          strokeWidth="5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_18px_rgba(192,132,252,0.95)]"
                        />

                        <path
                          d="M0 180 L90 230 L180 260 L270 280 L360 305 L450 330 L540 320 L630 345 L720 335 L810 360 L900 375 L1000 295"
                          stroke="#fb7185"
                          strokeWidth="5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_18px_rgba(251,113,133,0.95)]"
                        />

                        {[
                          [270, 220, "#34d399"],
                          [450, 170, "#34d399"],
                          [720, 135, "#34d399"],
                          [900, 95, "#34d399"],
                          [360, 230, "#22d3ee"],
                          [540, 185, "#22d3ee"],
                          [810, 165, "#22d3ee"],
                          [450, 175, "#c084fc"],
                          [810, 145, "#c084fc"],
                          [540, 320, "#fb7185"],
                          [810, 360, "#fb7185"],
                          [900, 375, "#fb7185"],
                        ].map(([cx, cy, color], idx) => (
                          <circle
                            key={idx}
                            cx={cx}
                            cy={cy}
                            r="6"
                            fill={color}
                            stroke="rgba(255,255,255,0.6)"
                            strokeWidth="2"
                            className="drop-shadow-[0_0_14px_currentColor]"
                          />
                        ))}

                        {[80, 190, 300, 410, 520, 630, 740, 850].map((x, idx) => (
                          <rect
                            key={idx}
                            x={x}
                            y={340 - (idx % 2 === 0 ? 25 : 42)}
                            width="32"
                            height={idx % 2 === 0 ? 25 : 42}
                            rx="6"
                            fill="rgba(34,211,238,0.14)"
                          />
                        ))}
                      </svg>

                      <div className="absolute bottom-4 left-0 right-0 flex justify-between px-5 text-[11px] tracking-[0.18em] text-gray-500">
                        <span>08:00</span>
                        <span>10:00</span>
                        <span>12:00</span>
                        <span>14:00</span>
                        <span>16:00</span>
                        <span>18:00</span>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
                      {[
                        ["Revenue Momentum", "78", "Revenue acelerando con demanda estable.", "emerald"],
                        ["Operational Stability", "61", "Presión operativa moderada detectada.", "cyan"],
                        ["Digital Sync", "72", "Ecosistema digital sincronizado.", "purple"],
                        ["Support Friction", "38", "Fricción elevada en soporte y atención.", "rose"],
                      ].map(([label, value, desc, tone]) => {
                        const styles =
                          tone === "emerald"
                            ? "border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-300"
                            : tone === "cyan"
                              ? "border-cyan-500/20 bg-cyan-500/[0.05] text-cyan-300"
                              : tone === "purple"
                                ? "border-purple-500/20 bg-purple-500/[0.05] text-purple-300"
                                : "border-rose-500/20 bg-rose-500/[0.05] text-rose-300";

                        return (
                          <button
                            key={label}
                            onClick={() =>
                              abrirDetalle({
                                titulo: label,
                                valor: value,
                                descripcion: desc,
                                fuente: "Executive Pulse Engine™",
                                accion: "Convertir esta lectura en decisión ejecutiva y acción priorizada.",
                              })
                            }
                            className={`rounded-2xl border p-4 text-left transition hover:bg-white/[0.045] ${styles}`}
                          >
                            <p className="text-[10px] uppercase tracking-[0.18em]">{label}</p>
                            <p className="mt-3 text-3xl font-black text-white">{value}</p>
                            <p className="mt-2 text-xs leading-5 text-gray-500">{desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-cyan-500/20 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.08),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 backdrop-blur-xl shadow-[0_0_60px_rgba(34,211,238,0.045)]">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-cyan-300">Executive Signals™</p>
                      <p className="mt-1 text-xs text-gray-500">Feed ejecutivo de anomalías y prioridades</p>
                    </div>
                    <button
                      onClick={() =>
                        abrirDetalle({
                          titulo: "Executive Signals™",
                          valor: "4 activas",
                          descripcion: "Feed ejecutivo de señales de presión, riesgo y oportunidad.",
                          fuente: "Command Center™ • Signal Feed",
                          accion: "Convertir señales críticas en acciones con responsable y fecha compromiso.",
                        })
                      }
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300 transition hover:border-cyan-400/25 hover:bg-cyan-500/10"
                    >
                      Ver todas
                    </button>
                  </div>

                  <div className="space-y-2">
                    {[
                      ["Soporte bajo presión", "Tiempos de respuesta por encima del promedio.", "Alta", "text-red-300", "border-red-500/25 bg-red-500/10"],
                      ["Seguimiento comercial irregular", "Oportunidades sin actividad en los últimos 7 días.", "Media", "text-yellow-300", "border-yellow-500/25 bg-yellow-500/10"],
                      ["Conexión de fuentes pendiente", "WhatsApp y CRM aún no conectados.", "Info", "text-cyan-300", "border-cyan-500/25 bg-cyan-500/10"],
                      ["Ritmo digital positivo", "Interacciones y contenido en aumento sostenido.", "Positiva", "text-green-300", "border-green-500/25 bg-green-500/10"],
                    ].map(([title, body, tag, color, cls], index) => (
                      <button
                        key={title}
                        onClick={() =>
                          abrirDetalle({
                            titulo: title,
                            valor: tag,
                            descripcion: body,
                            fuente: "Executive Signals™",
                            accion: "Convertir esta señal en acción con responsable, fecha y seguimiento.",
                          })
                        }
                        className="group flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-2.5 text-left transition hover:border-cyan-400/25 hover:bg-cyan-500/10"
                      >
                        <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${cls} text-[11px] font-black transition group-hover:scale-105`}>
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[13px] font-bold ${color}`}>{title}</span>
                          <span className="mt-1 block text-[11px] leading-4 text-gray-500">{body}</span>
                        </span>
                        <span className={`rounded-full border px-2 py-1 text-[10px] ${cls}`}>{tag}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500">
                      <span>Signal Health</span>
                      <span className="text-cyan-300">Active</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[72%] rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.55)]" />
                    </div>
                  </div>
                </div>
              </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                {[
                  ["SALUD OPERATIVA", "80%", "Estable", "Procesos funcionando dentro de parámetros normales.", "text-green-300", "border-green-500/20"],
                  ["PRESIÓN COMERCIAL", "Media", "Atención", "Tensión moderada en leads, seguimiento y conversión.", "text-yellow-300", "border-yellow-500/20"],
                  ["RIESGO EMPRESARIAL", `${bnsMetrics.riesgoScore}%`, "Controlado", "Mantener monitoreo en áreas críticas.", "text-red-300", "border-red-500/20"],
                  ["COORDINACIÓN", "78%", "Adecuada", "Colaboración entre áreas en nivel adecuado.", "text-cyan-300", "border-cyan-500/20"],
                ].map(([title, value, tag, desc, color, border]) => (
                  <button
                    key={title}
                    onClick={() =>
                      abrirDetalle({
                        titulo: title,
                        valor: value,
                        descripcion: desc,
                        fuente: "Executive Diagnostics™",
                        accion: "Abrir seguimiento, validar causa raíz y definir acción ejecutiva si el indicador se degrada.",
                      })
                    }
                    className={`group relative overflow-hidden rounded-[1.8rem] border ${border} bg-white/[0.035] p-5 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.055]`}
                  >
                    <p className={`text-xs font-bold uppercase tracking-[0.22em] ${color}`}>{title}</p>
                    <div className="mt-4 flex items-end gap-2">
                      <h3 className={`text-3xl font-black ${color}`}>{value}</h3>
                      <span className="mb-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/60">{tag}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-400">{desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {tabActiva === "operaciones" && (
            <div className="space-y-6">

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-cyan-300">EXECUTIVE LAYERS™</p>
                    <h2 className="mt-3 text-3xl font-black">CEO / CFO / CRO decision view</h2>
                    <p className="mt-3 max-w-5xl text-sm leading-6 text-gray-400">
                      BNS™ traduce el pipeline, forecast, presión y memoria en capas ejecutivas para decidir con contexto financiero, comercial y sistémico.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
                  {[executiveLayers.ceo, executiveLayers.cfo, executiveLayers.cro].map((layer) => (
                    <div key={layer.title} className="rounded-3xl border border-white/10 bg-black/30 p-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{layer.title}</p>
                      <h3 className="mt-2 text-xl font-bold text-white">{layer.subtitle}</h3>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {layer.metrics.map((metric) => (
                          <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{metric.label}</p>
                            <p className="mt-1 text-lg font-black text-cyan-300">{metric.value}</p>
                            <p className="mt-1 text-[10px] leading-4 text-gray-500">{metric.note}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Decisión</p>
                        <p className="mt-2 text-sm leading-6 text-gray-200">{layer.decision}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {tarjetaInteractiva(
                  "CARGA OPERATIVA",
                  "Alta",
                  "Indica acumulación de tareas, tickets, solicitudes o carga de atención.",
                  "text-yellow-400",
                  "Hoy simulado. Después saldrá de tickets, hojas de operación o Supabase.",
                  "Priorizar tareas críticas y automatizar clasificación de solicitudes."
                )}

                {tarjetaInteractiva(
                  "CUELLOS DE BOTELLA",
                  "2 detectados",
                  "Puntos donde el trabajo se detiene por aprobación, falta de respuesta o saturación.",
                  "text-red-400",
                  "Hoy simulado. Después se detectará con tiempos entre etapas y responsables.",
                  "Mapear procesos y medir dónde se acumulan solicitudes."
                )}

                {tarjetaInteractiva(
                  "EFICIENCIA",
                  "81%",
                  "Relación entre volumen de trabajo, velocidad de respuesta y cumplimiento.",
                  "text-green-400",
                  "Hoy simulado. Después se calculará con tareas completadas vs pendientes.",
                  "Definir indicadores operativos por área y medirlos semanalmente."
                )}
              </div>
            </div>
          )}

          {tabActiva === "revenue" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
                {tarjetaInteractiva(
                  "PIPELINE COMERCIAL",
                  formatoMoneda(bnsMetrics.pipelineTotal || 4200000),
                  "Valor estimado de oportunidades abiertas en proceso comercial.",
                  "text-cyan-400",
                  "Hoy simulado. Después vendrá de CRM, formularios o Supabase.",
                  "Registrar oportunidades por etapa, monto y probabilidad."
                )}

                {tarjetaInteractiva(
                  "CONVERSIÓN",
                  `${bnsMetrics.conversion}%`,
                  "Porcentaje de prospectos que avanzan hacia venta o cita efectiva.",
                  "text-green-400",
                  "Hoy simulado. Después se calculará con leads capturados y ventas cerradas.",
                  "Medir fuente de lead, etapa y razón de pérdida."
                )}

                {tarjetaInteractiva(
                  "PRONÓSTICO",
                  bnsMetrics.leadsActivos > 0 ? "Activo" : "Estable",
                  "Lectura ejecutiva del comportamiento esperado de ingresos.",
                  "text-yellow-400",
                  "Hoy simulado. Después usará pipeline, histórico y velocidad comercial.",
                  "Crear forecast mensual con probabilidad por oportunidad."
                )}

                {tarjetaInteractiva(
                  "CLIENTES EN RIESGO",
                  `${bnsMetrics.clientesEnRiesgo}`,
                  "Clientes o prospectos con señales de enfriamiento, retraso o abandono.",
                  "text-red-400",
                  "Hoy simulado. Después se detectará por inactividad, tickets y mensajes sin responder.",
                  "Activar seguimiento automático y alertas de recuperación."
                )}
              </div>
            </div>
          )}

          {tabActiva === "clientes" && (
            <div className="space-y-6">

              <div className="rounded-[2rem] border border-cyan-500/20 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-cyan-300">REVENUE INTELLIGENCE™</p>
                    <h2 className="mt-3 text-3xl font-black">Segmentación ejecutiva del pipeline</h2>
                    <p className="mt-3 max-w-5xl text-sm leading-6 text-gray-400">
                      Esta vista muestra cómo se distribuye el revenue por etapa, riesgo, temperatura y responsable. BNS™ prioriza lo que puede afectar forecast y caja.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-right">
                    <p className="text-xs tracking-[0.25em] text-red-300">REVENUE AT RISK</p>
                    <h3 className="mt-2 text-3xl font-black text-red-200">{formatoMoneda(revenueSegmentation.revenueAtRisk)}</h3>
                    <p className="mt-1 text-xs text-gray-400">{safePercent(revenueSegmentation.riskPercent)}% del pipeline</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                    <p className="text-xs tracking-[0.25em] text-cyan-300">PIPELINE POR ETAPA</p>
                    <div className="mt-5 space-y-3">
                      {revenueSegmentation.byStage.map((item) => (
                        <div key={item.label}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-gray-300">{item.label}</span>
                            <span className="text-cyan-300">{item.count} • {formatoMoneda(item.value)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10">
                            <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${Math.max(4, item.percent)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                    <p className="text-xs tracking-[0.25em] text-yellow-300">RIESGO Y TEMPERATURA</p>
                    <div className="mt-5 space-y-4">
                      {revenueSegmentation.byRisk.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold">{item.label}</p>
                            <p className="text-xs text-yellow-300">{item.count} leads</p>
                          </div>
                          <p className="mt-1 text-xs text-gray-400">{formatoMoneda(item.value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                    <p className="text-xs tracking-[0.25em] text-purple-300">REVENUE POR RESPONSABLE</p>
                    <div className="mt-5 max-h-[260px] space-y-3 overflow-y-auto pr-1">
                      {revenueSegmentation.byOwner.slice(0, 8).map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-bold">{item.label}</p>
                            <p className="text-xs text-purple-300">{formatoMoneda(item.value)}</p>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{item.count} leads • {item.critical} críticos</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl">
                <p className="text-sm tracking-[0.3em] text-cyan-300">
                  CLIENT INTELLIGENCE™
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Pipeline vivo conectado al diagnóstico BNS™
                </h2>

                <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-400">
                  Registra oportunidades, temperatura comercial, riesgo y próxima acción.
                  Estos datos ya alimentan las métricas del dashboard y el reporte ejecutivo.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-cyan-300">PIPELINE</p>
                  <h3 className="mt-3 text-3xl font-bold text-cyan-300">
                    {formatoMoneda(bnsMetrics.pipelineTotal)}
                  </h3>
                  <p className="mt-2 text-xs text-gray-400">Valor total registrado.</p>
                </div>

                <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-green-300">LEADS ACTIVOS</p>
                  <h3 className="mt-3 text-3xl font-bold text-green-300">
                    {bnsMetrics.leadsActivos}
                  </h3>
                  <p className="mt-2 text-xs text-gray-400">Oportunidades abiertas.</p>
                </div>

                <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-yellow-300">CALIENTES</p>
                  <h3 className="mt-3 text-3xl font-bold text-yellow-300">
                    {bnsMetrics.leadsCalientes}
                  </h3>
                  <p className="mt-2 text-xs text-gray-400">Prioridad comercial inmediata.</p>
                </div>

                <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-red-300">RIESGO</p>
                  <h3 className="mt-3 text-3xl font-bold text-red-300">
                    {bnsMetrics.clientesEnRiesgo}
                  </h3>
                  <p className="mt-2 text-xs text-gray-400">Clientes o leads en alerta.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-6">
                  <p className="text-sm tracking-[0.3em] text-cyan-300">
                    NUEVA OPORTUNIDAD
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4">
                    <input
                      value={nuevoLead.empresa}
                      onChange={(event) => actualizarNuevoLead("empresa", event.target.value)}
                      placeholder="Empresa / cliente"
                      className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <input
                      value={nuevoLead.contacto}
                      onChange={(event) => actualizarNuevoLead("contacto", event.target.value)}
                      placeholder="Contacto principal"
                      className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input
                        value={nuevoLead.email}
                        onChange={(event) => actualizarNuevoLead("email", event.target.value)}
                        placeholder="Email"
                        className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                      />

                      <input
                        value={nuevoLead.telefono}
                        onChange={(event) => actualizarNuevoLead("telefono", event.target.value)}
                        placeholder="Teléfono / WhatsApp"
                        className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input
                        value={nuevoLead.monto}
                        onChange={(event) => actualizarNuevoLead("monto", event.target.value)}
                        placeholder="Monto estimado"
                        className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                      />

                      <select
                        value={nuevoLead.etapa}
                        onChange={(event) => actualizarNuevoLead("etapa", event.target.value)}
                        className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none"
                      >
                        <option>Nuevo</option>
                        <option>Contactado</option>
                        <option>Propuesta</option>
                        <option>Negociación</option>
                        <option>Ganado</option>
                        <option>Perdido</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <select
                        value={nuevoLead.temperatura}
                        onChange={(event) => actualizarNuevoLead("temperatura", event.target.value)}
                        className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none"
                      >
                        <option>Caliente</option>
                        <option>Tibio</option>
                        <option>Frío</option>
                      </select>

                      <select
                        value={nuevoLead.riesgo}
                        onChange={(event) => actualizarNuevoLead("riesgo", event.target.value)}
                        className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none"
                      >
                        <option>Bajo</option>
                        <option>Medio</option>
                        <option>Alto</option>
                      </select>
                    </div>

                    <input
                      value={nuevoLead.proximaAccion}
                      onChange={(event) => actualizarNuevoLead("proximaAccion", event.target.value)}
                      placeholder="Próxima acción"
                      className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <textarea
                      value={nuevoLead.notas}
                      onChange={(event) => actualizarNuevoLead("notas", event.target.value)}
                      placeholder="Notas ejecutivas"
                      className="min-h-28 rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <button
                      onClick={agregarLead}
                      className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-8 py-4 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/25"
                    >
                      Agregar al pipeline
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm tracking-[0.3em] text-cyan-300">PIPELINE</p>
                      <h3 className="mt-2 text-2xl font-bold">Oportunidades registradas</h3>
                    </div>
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                      {leads.length} total
                    </span>
                  </div>

                  {leads.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center">
                      <p className="text-sm text-gray-400">
                        Aún no hay leads. Agrega el primero para activar el pipeline dinámico.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leads.map((lead) => {
                        const narrativa = construirNarrativaLead(lead);
                        return (
                          <div
                            key={lead.id}
                            className="rounded-3xl border border-white/10 bg-black/30 p-5"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
                                  {narrativa.estado}
                                </p>
                                <p className="mt-2 text-lg font-bold text-white">{lead.empresa}</p>
                                <p className="mt-1 text-sm text-gray-400">
                                  {lead.contacto} • {lead.telefono || lead.email || "Sin contacto"}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-lg font-bold text-cyan-300">
                                  {formatoMoneda(Number(lead.monto.replace(/[^0-9.]/g, "")) || 0)}
                                </p>
                                <p className="text-xs text-gray-500">{lead.etapa}</p>
                              </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                                Lectura ejecutiva
                              </p>
                              <p className="mt-2 text-sm leading-6 text-gray-200">{narrativa.resumen}</p>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 text-xs md:grid-cols-4">
                              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-300">
                                Temperatura: {lead.temperatura}
                              </div>
                              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-300">
                                Riesgo: {lead.riesgo}
                              </div>
                              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3 text-purple-300">
                                Owner: {narrativa.responsable}
                              </div>
                              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-green-300">
                                Etapa: {lead.etapa}
                              </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
                                Intervención recomendada
                              </p>
                              <p className="mt-2 text-sm leading-6 text-gray-200">{narrativa.recomendacion}</p>
                            </div>

                            {lead.notas && (
                              <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-gray-400">
                                {lead.notas}
                              </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                onClick={() => avanzarLead(lead.id)}
                                className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300"
                              >
                                Avanzar etapa
                              </button>
                              <button
                                onClick={() => marcarLeadPerdido(lead.id)}
                                className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-bold text-red-300"
                              >
                                Marcar riesgo/perdido
                              </button>
                              <button
                                onClick={() => eliminarLead(lead.id)}
                                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-gray-400"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tabActiva === "acciones" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl">
                <p className="text-sm tracking-[0.3em] text-cyan-300">
                  EXECUTIVE ACTION ENGINE™
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Tareas, responsables y acciones críticas
                </h2>

                <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-400">
                  Este módulo convierte el diagnóstico de BNS™ en ejecución: qué se debe hacer, quién lo hace, cuándo vence, qué impacto tiene y cómo afecta la presión empresarial.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                    <p className="text-xs tracking-[0.25em] text-cyan-300">PENDIENTES</p>
                    <h3 className="mt-2 text-3xl font-bold text-cyan-300">{bnsMetrics.accionesPendientes}</h3>
                  </div>
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-xs tracking-[0.25em] text-red-300">ALTA PRIORIDAD</p>
                    <h3 className="mt-2 text-3xl font-bold text-red-300">{bnsMetrics.accionesAltaPrioridad}</h3>
                  </div>
                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                    <p className="text-xs tracking-[0.25em] text-yellow-300">VENCIDAS</p>
                    <h3 className="mt-2 text-3xl font-bold text-yellow-300">{bnsMetrics.accionesVencidas}</h3>
                  </div>
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                    <p className="text-xs tracking-[0.25em] text-green-300">CUMPLIMIENTO</p>
                    <h3 className="mt-2 text-3xl font-bold text-green-300">{bnsMetrics.cumplimientoAcciones}%</h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-6">
                  <p className="text-sm tracking-[0.3em] text-cyan-300">NUEVA ACCIÓN</p>
                  <h3 className="mt-3 text-2xl font-bold">Crear acción ejecutiva</h3>

                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <input
                      value={nuevaAccion.titulo}
                      onChange={(event) => actualizarNuevaAccion("titulo", event.target.value)}
                      placeholder="Título de la acción, ejemplo: Recuperar leads calientes"
                      className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <input
                      value={nuevaAccion.responsable}
                      onChange={(event) => actualizarNuevaAccion("responsable", event.target.value)}
                      placeholder="Responsable"
                      className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <select
                        value={nuevaAccion.prioridad}
                        onChange={(event) => actualizarNuevaAccion("prioridad", event.target.value)}
                        className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none"
                      >
                        <option>Alta</option>
                        <option>Media</option>
                        <option>Baja</option>
                      </select>

                      <select
                        value={nuevaAccion.impacto}
                        onChange={(event) => actualizarNuevaAccion("impacto", event.target.value)}
                        className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none"
                      >
                        <option>Alto</option>
                        <option>Medio</option>
                        <option>Bajo</option>
                      </select>

                      <input
                        type="date"
                        value={nuevaAccion.fechaCompromiso === "Sin fecha" ? "" : nuevaAccion.fechaCompromiso}
                        onChange={(event) => actualizarNuevaAccion("fechaCompromiso", event.target.value)}
                        className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none"
                      />
                    </div>

                    <select
                      value={nuevaAccion.leadRelacionado}
                      onChange={(event) => actualizarNuevaAccion("leadRelacionado", event.target.value)}
                      className="rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none"
                    >
                      <option value="">Sin lead relacionado</option>
                      {leads.map((lead) => (
                        <option key={lead.id} value={lead.empresa}>
                          {lead.empresa} • {lead.etapa}
                        </option>
                      ))}
                    </select>

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold tracking-[0.25em] text-cyan-300">RECOMENDACIÓN BNS™ AUTOMÁTICA</p>
                        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] font-bold text-green-300">
                          Auto-generada
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-gray-300">
                        {generarRecomendacionBNSAccion(nuevaAccion)}
                      </p>
                      <p className="mt-3 text-xs leading-5 text-gray-500">
                        BNS™ calcula esta recomendación con prioridad, impacto, fecha y lead relacionado. No necesitas escribirla manualmente.
                      </p>
                    </div>

                    <textarea
                      value={nuevaAccion.notas}
                      onChange={(event) => actualizarNuevaAccion("notas", event.target.value)}
                      placeholder="Notas internas"
                      className="min-h-20 rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm outline-none placeholder:text-gray-600"
                    />

                    <button
                      onClick={agregarAccionEjecutiva}
                      className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-6 py-4 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/25"
                    >
                      Agregar acción ejecutiva
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-6">
                  <p className="text-sm tracking-[0.3em] text-purple-300">BNS™ ACTION INTELLIGENCE</p>
                  <h3 className="mt-3 text-2xl font-bold">Acciones que reducen presión</h3>
                  <p className="mt-4 text-sm leading-6 text-gray-300">
                    BNS™ eleva el riesgo cuando existen acciones vencidas o de alta prioridad sin cerrar. Completar acciones incrementa procesos, salud operativa y control ejecutivo.
                  </p>

                  <div className="mt-6 space-y-3">
                    {[
                      "Prioriza acciones de alto impacto y baja complejidad.",
                      "Conecta cada acción crítica con un lead, área o responsable.",
                      "Revisa vencidas antes de generar nuevas campañas.",
                    ].map((texto) => (
                      <div key={texto} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
                        {texto}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {accionesEjecutivas.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
                    Aún no hay acciones ejecutivas. Crea la primera para activar el motor de ejecución BNS™.
                  </div>
                ) : (
                  accionesEjecutivas.map((accion) => (
                    <div key={accion.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${accion.prioridad === "Alta" ? "bg-red-500/10 text-red-300" : accion.prioridad === "Media" ? "bg-yellow-500/10 text-yellow-300" : "bg-green-500/10 text-green-300"}`}>
                              {accion.prioridad}
                            </span>
                            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                              {accion.impacto}
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                              {accion.estado}
                            </span>
                          </div>
                          <h3 className="mt-4 text-2xl font-bold">{accion.titulo}</h3>
                          <p className="mt-2 text-sm text-gray-400">Responsable: {accion.responsable}</p>
                          <p className="mt-1 text-sm text-gray-400">Fecha compromiso: {accion.fechaCompromiso}</p>
                          {accion.leadRelacionado && (
                            <p className="mt-1 text-sm text-cyan-300">Lead relacionado: {accion.leadRelacionado}</p>
                          )}
                          <p className="mt-4 text-sm leading-6 text-gray-300">{accion.recomendacionBNS}</p>
                          {accion.notas && <p className="mt-3 text-xs leading-5 text-gray-500">Notas: {accion.notas}</p>}
                        </div>

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <button
                            onClick={() => cambiarEstadoAccion(accion.id, "En proceso")}
                            className="rounded-xl border border-cyan-400/30 px-4 py-2 text-xs text-cyan-300"
                          >
                            En proceso
                          </button>
                          <button
                            onClick={() => cambiarEstadoAccion(accion.id, "Completada")}
                            className="rounded-xl border border-green-400/30 px-4 py-2 text-xs text-green-300"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => cambiarEstadoAccion(accion.id, "Vencida")}
                            className="rounded-xl border border-yellow-400/30 px-4 py-2 text-xs text-yellow-300"
                          >
                            Vencida
                          </button>
                          <button
                            onClick={() => eliminarAccionEjecutiva(accion.id)}
                            className="rounded-xl border border-red-400/30 px-4 py-2 text-xs text-red-300"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}


          {tabActiva === "importador" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl">
                <p className="text-sm tracking-[0.3em] text-cyan-300">
                  DATA INGESTION LAYER™
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Integrations Hub™ para alimentar BNS™
                </h2>

                <p className="mt-4 max-w-5xl text-sm leading-6 text-gray-400">
                  Sube bases comerciales, listas de clientes, pipeline o reportes operativos. BNS™ detecta columnas,
                  normaliza registros y los convierte en leads para alimentar métricas, radar, tendencias y PDF ejecutivo.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
                  <div className="min-w-0 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                    <p className="text-xs tracking-[0.25em] text-cyan-300">ARCHIVO</p>
                    <h3 className="mt-2 break-words text-sm font-bold xl:text-base">{archivoImportado || "Pendiente"}</h3>
                  </div>

                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                    <p className="text-xs tracking-[0.25em] text-green-300">REGISTROS</p>
                    <h3 className="mt-2 text-lg font-bold text-green-300">{filasImportadas.length}</h3>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                    <p className="text-xs tracking-[0.25em] text-yellow-300">PIPELINE CSV</p>
                    <h3 className="mt-2 text-lg font-bold text-yellow-300">{formatoMoneda(csvEcosystemStats.pipeline)}</h3>
                  </div>

                  <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                    <p className="text-xs tracking-[0.25em] text-purple-300">ECOSISTEMA</p>
                    <h3 className="mt-2 text-lg font-bold text-purple-300">{csvEcosystemStats.estado}</h3>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 xl:col-span-4">
                    <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="text-xs tracking-[0.25em] text-gray-500">SUPABASE SYNC</p>
                        <h3 className="mt-2 text-sm font-bold text-gray-300">{mensajeSupabase}</h3>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          supabaseConectado
                            ? "border-green-500/20 bg-green-500/10 text-green-300"
                            : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                        }`}
                      >
                        {sincronizandoSupabase ? "Sincronizando..." : supabaseConectado ? "Conectado" : "Pendiente"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-3xl border border-cyan-500/20 bg-black/40 p-6">
                  <p className="text-sm tracking-[0.3em] text-cyan-300">SUBIR ARCHIVO</p>
                  <h3 className="mt-3 text-2xl font-bold">Carga CSV exportado desde Excel</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    En esta versión local, usa CSV UTF-8. Después se puede conectar lectura XLSX directa con SheetJS
                    y guardado real en Supabase.
                  </p>

                  <label className="mt-6 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-400/40 bg-cyan-500/10 p-6 text-center transition hover:bg-cyan-500/20">
                    <span className="text-5xl">⇧</span>
                    <span className="mt-4 text-sm font-bold text-cyan-200">Arrastra o selecciona tu archivo</span>
                    <span className="mt-2 text-xs text-gray-400">CSV, TSV o archivo exportado desde Excel</span>
                    <input
                      type="file"
                      accept=".csv,.tsv,.txt,.xlsx,.xls"
                      onChange={cargarArchivoImportacion}
                      className="hidden"
                    />
                  </label>

                  {mensajeImportacion && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-gray-300">
                      {mensajeImportacion}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={importarFilasAlPipeline}
                      className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-6 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/25"
                    >
                      Conectar al ecosistema BNS™
                    </button>

                    <button
                      onClick={limpiarImportador}
                      className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/10"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm tracking-[0.3em] text-cyan-300">PREVIEW INTELIGENTE</p>
                      <h3 className="mt-2 text-2xl font-bold">Registros detectados</h3>
                    </div>
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                      {filasImportadas.length} filas • {csvEcosystemStats.responsables.length} responsables
                    </span>
                  </div>

                  {filasImportadas.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-sm leading-7 text-gray-400">
                      Aún no hay registros cargados. Tu archivo debería tener encabezados parecidos a:
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs xl:grid-cols-4">
                        {["Cliente", "Contacto", "Monto", "Etapa", "Responsable", "Riesgo", "Temperatura", "Próxima acción"].map((item) => (
                          <span key={item} className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-cyan-200">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-[520px] overflow-auto rounded-2xl border border-white/10">
                      <table className="w-full min-w-[900px] text-left text-xs">
                        <thead className="sticky top-0 bg-black text-gray-400">
                          <tr>
                            <th className="p-3">Cliente</th>
                            <th className="p-3">Contacto</th>
                            <th className="p-3">Monto</th>
                            <th className="p-3">Etapa</th>
                            <th className="p-3">Temperatura</th>
                            <th className="p-3">Riesgo</th>
                            <th className="p-3">Responsable</th>
                            <th className="p-3">Próxima acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filasImportadas.map((fila, index) => (
                            <tr key={`${fila.cliente}-${fila.contacto}-${index}`} className="border-t border-white/10 text-gray-300">
                              <td className="p-3 font-semibold text-white">{fila.cliente || "Sin cliente"}</td>
                              <td className="p-3">{fila.contacto || "Pendiente"}</td>
                              <td className="p-3 text-cyan-300">{fila.monto || "0"}</td>
                              <td className="p-3">{fila.etapa}</td>
                              <td className="p-3">{fila.temperatura}</td>
                              <td className="p-3">{fila.riesgo}</td>
                              <td className="p-3">{fila.responsable || "Sin asignar"}</td>
                              <td className="p-3">{fila.proximaAccion || "Dar seguimiento"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {filasImportadas.length > 0 && (
                    <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs text-gray-500">Activos</p>
                        <p className="mt-2 text-xl font-bold text-cyan-300">{csvEcosystemStats.activos}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs text-gray-500">Calientes</p>
                        <p className="mt-2 text-xl font-bold text-green-300">{csvEcosystemStats.calientes}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs text-gray-500">Riesgo alto</p>
                        <p className="mt-2 text-xl font-bold text-red-300">{csvEcosystemStats.altoRiesgo}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs text-gray-500">Conversión</p>
                        <p className="mt-2 text-xl font-bold text-purple-300">{csvEcosystemStats.conversion}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}




          
          
          {tabActiva === "organization" && (
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-cyan-300">ORGANIZATIONAL DRILLDOWN™</p>
                    <h2 className="mt-3 text-4xl font-bold">De CEO a ejecución</h2>
                    <p className="mt-4 max-w-5xl text-sm leading-6 text-gray-400">
                      BNS™ permite que Dirección General vea toda la organización y descienda por capas: directores, gerentes, ejecutivos, señales e intervenciones.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5">
                    <p className="text-xs tracking-[0.25em] text-purple-300">PERSPECTIVA ACTIVA</p>
                    <h3 className="mt-2 text-2xl font-bold text-purple-200">{nivelVista}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-300">{organizationalDrilldown.lectura}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/10 p-6">
                <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-purple-300">ENTERPRISE GRAPH™</p>
                    <h3 className="mt-3 text-3xl font-black">Mapa vivo de nodos ejecutivos</h3>
                    <p className="mt-3 max-w-5xl text-sm leading-6 text-gray-300">
                      {enterpriseGraph.lectura}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                      <p className="text-xs text-red-300">Críticos</p>
                      <p className="mt-1 text-3xl font-black text-red-200">{enterpriseGraph.criticalNodes}</p>
                    </div>
                    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center">
                      <p className="text-xs text-yellow-300">Watch</p>
                      <p className="mt-1 text-3xl font-black text-yellow-200">{enterpriseGraph.watchNodes}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.8fr]">
                  <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 p-6">
                    <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(168,85,247,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.12)_1px,transparent_1px)] [background-size:36px_36px]" />

                    <div className="relative z-10 grid min-h-[360px] place-items-center">
                      <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-center shadow-[0_0_60px_rgba(34,211,238,0.15)]">
                        <div>
                          <p className="text-xs tracking-[0.25em] text-cyan-300">CORE</p>
                          <h4 className="mt-2 text-lg font-black">{nombreEmpresa}</h4>
                          <p className="mt-1 text-xs text-gray-400">{safeNumber(bnsMetrics.bnsScore)}/100</p>
                        </div>
                      </div>

                      <div className="absolute left-[8%] top-[10%]">
                        {enterpriseGraph.nodes.slice(1, 2).map((node) => (
                          <div key={node.id} className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 shadow-xl">
                            <p className="text-xs text-green-300">{node.tipo}</p>
                            <p className="text-sm font-bold">{node.label}</p>
                            <p className="text-xs text-gray-400">{node.valor}</p>
                          </div>
                        ))}
                      </div>

                      <div className="absolute right-[8%] top-[12%]">
                        {enterpriseGraph.nodes.slice(2, 3).map((node) => (
                          <div key={node.id} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 shadow-xl">
                            <p className="text-xs text-yellow-300">{node.tipo}</p>
                            <p className="text-sm font-bold">{node.label}</p>
                            <p className="text-xs text-gray-400">{node.valor}</p>
                          </div>
                        ))}
                      </div>

                      <div className="absolute bottom-[12%] left-[10%]">
                        {enterpriseGraph.nodes.slice(3, 4).map((node) => (
                          <div key={node.id} className="rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 shadow-xl">
                            <p className="text-xs text-purple-300">{node.tipo}</p>
                            <p className="text-sm font-bold">{node.label}</p>
                            <p className="text-xs text-gray-400">{node.valor}</p>
                          </div>
                        ))}
                      </div>

                      <div className="absolute bottom-[10%] right-[8%]">
                        {enterpriseGraph.nodes.filter((node) => node.id === "decision").map((node) => (
                          <div key={node.id} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 shadow-xl">
                            <p className="text-xs text-cyan-300">{node.tipo}</p>
                            <p className="text-sm font-bold">{node.label}</p>
                            <p className="text-xs text-gray-400">{node.valor}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5">
                    <p className="text-xs tracking-[0.25em] text-cyan-300">CONEXIONES</p>
                    <div className="mt-4 max-h-[390px] space-y-3 overflow-y-auto pr-1">
                      {enterpriseGraph.edges.map((edge) => (
                        <div key={`${edge.from}-${edge.to}-${edge.label}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-white">{edge.label}</p>
                            <span className={`rounded-full px-2 py-1 text-[10px] ${
                              edge.fuerza === "Alta"
                                ? "bg-red-500/10 text-red-300"
                                : edge.fuerza === "Media"
                                ? "bg-yellow-500/10 text-yellow-300"
                                : "bg-cyan-500/10 text-cyan-300"
                            }`}>
                              {edge.fuerza}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">{edge.from} → {edge.to}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {organizationalDrilldown.niveles.map((nivel) => (
                  <button
                    key={nivel.nivel}
                    type="button"
                    onClick={() => {
                      setNivelVista(nivel.nivel);
                      setNodoOrganizacionalActivo(nivel.titulo);
                    }}
                    className={`rounded-3xl border p-5 text-left transition ${
                      nivelVista === nivel.nivel
                        ? "border-cyan-400/40 bg-cyan-400/15 shadow-[0_0_40px_rgba(34,211,238,0.14)]"
                        : "border-white/10 bg-white/5 hover:border-cyan-400/30 hover:bg-cyan-400/10"
                    }`}
                  >
                    <p className="text-xs font-bold tracking-[0.25em] text-cyan-300">{nivel.nivel}</p>
                    <h3 className="mt-3 text-xl font-bold">{nivel.titulo}</h3>
                    <p className="mt-2 text-xs leading-5 text-gray-400">{nivel.alcance}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm tracking-[0.3em] text-cyan-300">VISIBILITY LAYER™</p>
                      <h3 className="mt-2 text-2xl font-bold">{nodoOrganizacionalActivo}</h3>
                    </div>
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                      {nivelVista}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {organizationalDrilldown.niveles
                      .find((nivel) => nivel.nivel === nivelVista)
                      ?.metricas.map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="mt-2 text-lg font-bold text-cyan-300">{value}</p>
                        </div>
                      ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                    <p className="text-sm font-bold text-yellow-300">Regla de acceso BNS™</p>
                    <p className="mt-2 text-sm leading-6 text-gray-300">
                      CEO ve todo. Director ve su dirección y debajo. Gerente ve su equipo y ejecución. Ejecutivo ve solo lo asignado.
                    </p>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-cyan-500/20 bg-black/40 p-6">
                  <p className="text-sm tracking-[0.3em] text-cyan-300">ORGANIZATIONAL TREE™</p>
                  <h3 className="mt-2 text-2xl font-bold">Mapa vivo de jerarquía</h3>

                  <div className="mt-6 space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        setNivelVista("CEO");
                        setNodoOrganizacionalActivo("CEO / Dirección General");
                      }}
                      className="w-full rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-5 text-left"
                    >
                      <p className="text-xs tracking-[0.25em] text-cyan-300">CEO</p>
                      <h4 className="mt-2 text-xl font-bold">Dirección General</h4>
                      <p className="mt-2 text-sm text-gray-400">Visión completa de empresa, forecast, presión y riesgo.</p>
                    </button>

                    <div className="ml-4 space-y-4 border-l border-cyan-500/20 pl-4">
                      {organizationalDrilldown.ejecutivosPorLider.map((grupo) => (
                        <div key={grupo.lider} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                          <button
                            type="button"
                            onClick={() => {
                              setNivelVista("Director");
                              setNodoOrganizacionalActivo(grupo.lider);
                            }}
                            className="flex w-full items-center justify-between gap-4 text-left"
                          >
                            <div>
                              <p className="text-xs tracking-[0.25em] text-purple-300">DIRECTOR / LÍDER</p>
                              <h4 className="mt-1 text-lg font-bold">{grupo.lider}</h4>
                              <p className="mt-1 text-xs text-gray-500">
                                Score {grupo.scorePromedio} • Riesgo {grupo.riesgoPromedio}%
                              </p>
                            </div>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs ${
                                grupo.estado === "Riesgo"
                                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                                  : grupo.estado === "Presión"
                                  ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                                  : "border-green-500/20 bg-green-500/10 text-green-300"
                              }`}
                            >
                              {grupo.estado}
                            </span>
                          </button>

                          <div className="mt-4 ml-3 space-y-3 border-l border-white/10 pl-4">
                            {grupo.equipo.map((ejecutivo) => (
                              <button
                                key={ejecutivo.id}
                                type="button"
                                onClick={() => {
                                  setNivelVista("Ejecutivo");
                                  setNodoOrganizacionalActivo(ejecutivo.nombre);
                                }}
                                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500">{ejecutivo.area}</p>
                                    <h5 className="mt-1 font-bold text-white">{ejecutivo.nombre}</h5>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-cyan-300">{ejecutivo.score}</p>
                                    <p className="text-xs text-gray-500">{ejecutivo.estado}</p>
                                  </div>
                                </div>
                              </button>
                            ))}

                            {grupo.equipo.length === 0 && (
                              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-500">
                                Aún no hay ejecutivos bajo este líder.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {organizationalDrilldown.ejecutivosPorLider.length === 0 && (
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                          Agrega ejecutivos para construir el árbol organizacional.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/10 p-6">
                <p className="text-sm tracking-[0.3em] text-purple-300">INFLUENCE MAPPING™</p>
                <h3 className="mt-2 text-2xl font-bold">Personas clave invisibles</h3>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  BNS™ detectará quién impacta forecast, soporte, revenue, clientes críticos y velocidad de decisión aunque no aparezca formalmente como dueño del proceso.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs text-gray-500">Mayor dependencia</p>
                    <p className="mt-2 text-lg font-bold text-yellow-300">
                      {executiveHeatmap.mayorDependencia?.nombre || "Sin datos"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs text-gray-500">Mayor riesgo</p>
                    <p className="mt-2 text-lg font-bold text-red-300">
                      {executiveHeatmap.mayorRiesgo?.nombre || "Sin datos"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs text-gray-500">Top performer</p>
                    <p className="mt-2 text-lg font-bold text-green-300">
                      {executiveHeatmap.topPerformer?.nombre || "Sin datos"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

{tabActiva === "executive" && (
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-cyan-300">EXECUTIVE HEATMAP™</p>
                    <h2 className="mt-3 text-4xl font-bold">Quién impulsa o frena el sistema</h2>
                    <p className="mt-4 max-w-5xl text-sm leading-6 text-gray-400">
                      BNS™ cruza score ejecutivo, acciones abiertas, leads relacionados, riesgo, velocidad y dependencia para detectar líderes fuertes, saturados o críticos.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5">
                    <p className="text-xs tracking-[0.25em] text-purple-300">LECTURA BNS™</p>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-gray-300">{executiveHeatmap.resumen}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-green-300">TOP PERFORMER</p>
                  <h3 className="mt-3 text-2xl font-bold">{executiveHeatmap.topPerformer?.nombre || "Sin datos"}</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Score: {executiveHeatmap.topPerformer?.score ?? 0}/100
                  </p>
                </div>

                <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-red-300">MAYOR RIESGO</p>
                  <h3 className="mt-3 text-2xl font-bold">{executiveHeatmap.mayorRiesgo?.nombre || "Sin datos"}</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Riesgo: {executiveHeatmap.mayorRiesgo?.riesgoScore ?? 0}%
                  </p>
                </div>

                <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-yellow-300">DEPENDENCIA</p>
                  <h3 className="mt-3 text-2xl font-bold">{executiveHeatmap.mayorDependencia?.nombre || "Sin datos"}</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Dependencia: {executiveHeatmap.mayorDependencia?.dependenciaScore ?? 0}%
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-cyan-300">LEADERSHIP MATRIX™</p>
                    <h3 className="mt-2 text-2xl font-bold">Heatmap ejecutivo</h3>
                  </div>
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                    {executiveHeatmap.items.length} ejecutivo{executiveHeatmap.items.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {executiveHeatmap.items.map((ejecutivo) => (
                    <div
                      key={ejecutivo.id}
                      className={`rounded-3xl border p-5 ${
                        ejecutivo.color === "green"
                          ? "border-green-500/20 bg-green-500/10"
                          : ejecutivo.color === "red"
                          ? "border-red-500/20 bg-red-500/10"
                          : ejecutivo.color === "purple"
                          ? "border-purple-500/20 bg-purple-500/10"
                          : "border-yellow-500/20 bg-yellow-500/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">{ejecutivo.area}</p>
                          <h4 className="mt-2 text-2xl font-bold">{ejecutivo.nombre}</h4>
                          <p className="mt-1 text-sm text-gray-400">{ejecutivo.lider}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">{ejecutivo.score}</p>
                          <p className="text-xs text-gray-400">{ejecutivo.estado}</p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-gray-300">{ejecutivo.lectura}</p>

                      <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                          <p className="text-gray-500">Riesgo</p>
                          <p className="mt-1 font-bold text-red-300">{ejecutivo.riesgoScore}%</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                          <p className="text-gray-500">Dependencia</p>
                          <p className="mt-1 font-bold text-yellow-300">{ejecutivo.dependenciaScore}%</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                          <p className="text-gray-500">Velocidad</p>
                          <p className="mt-1 font-bold text-cyan-300">{ejecutivo.velocityScore}%</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {executiveHeatmap.items.length === 0 && (
                    <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-gray-400 xl:col-span-2">
                      Agrega ejecutivos para activar Heatmap™.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

{tabActiva === "forecast" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-cyan-300">FORECAST INTELLIGENCE™</p>
                    <h2 className="mt-3 text-3xl font-bold">Escenarios de revenue y riesgo de cumplimiento</h2>
                    <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-400">
                      BNS™ proyecta forecast conservador, probable y agresivo usando pipeline, etapa comercial, temperatura, acciones críticas y cumplimiento operativo.
                    </p>
                  </div>

                  <div className={`rounded-3xl border p-5 ${forecastIntelligence.riesgoCumplimiento === "Alto" ? "border-red-500/20 bg-red-500/10" : forecastIntelligence.riesgoCumplimiento === "Medio" ? "border-yellow-500/20 bg-yellow-500/10" : "border-green-500/20 bg-green-500/10"}`}>
                    <p className="text-xs tracking-[0.25em] text-gray-400">RIESGO FORECAST</p>
                    <h3 className="mt-2 text-4xl font-bold text-cyan-300">{forecastIntelligence.riesgoCumplimiento}</h3>
                    <p className="mt-2 text-xs text-gray-400">Confianza {safePercent(forecastIntelligence.confianza)}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-yellow-300">CONSERVADOR</p>
                  <h3 className="mt-3 text-3xl font-bold text-white">${forecastIntelligence.conservador.toLocaleString("es-MX")}</h3>
                  <p className="mt-3 text-xs leading-5 text-gray-400">Escenario con presión y baja velocidad de cierre.</p>
                </div>
                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-cyan-300">PROBABLE</p>
                  <h3 className="mt-3 text-3xl font-bold text-white">${forecastIntelligence.probable.toLocaleString("es-MX")}</h3>
                  <p className="mt-3 text-xs leading-5 text-gray-400">Pipeline ponderado por etapa comercial.</p>
                </div>
                <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-green-300">AGRESIVO</p>
                  <h3 className="mt-3 text-3xl font-bold text-white">${forecastIntelligence.agresivo.toLocaleString("es-MX")}</h3>
                  <p className="mt-3 text-xs leading-5 text-gray-400">Escenario con aceleración de seguimiento y cierre.</p>
                </div>
                <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5">
                  <p className="text-xs tracking-[0.25em] text-purple-300">META ESTIMADA</p>
                  <h3 className="mt-3 text-3xl font-bold text-white">${forecastIntelligence.metaEstimacion.toLocaleString("es-MX")}</h3>
                  <p className="mt-3 text-xs leading-5 text-gray-400">Desviación: {forecastIntelligence.desviacionVsMeta}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.8fr]">
                <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-6">
                  <p className="text-sm tracking-[0.3em] text-cyan-300">FORECAST CONFIDENCE</p>
                  <h3 className="mt-3 text-2xl font-bold">Confianza del forecast: {safePercent(forecastIntelligence.confianza)}%</h3>
                  <div className="mt-6 h-5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${safePercent(forecastIntelligence.confianza)}%` }} />
                  </div>
                  <p className="mt-5 text-sm leading-6 text-gray-400">{forecastIntelligence.lectura}</p>
                </div>

                <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
                  <p className="text-sm tracking-[0.3em] text-yellow-300">VARIABLES QUE MUEVEN FORECAST</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">Pipeline total: ${forecastIntelligence.pipelineTotal.toLocaleString("es-MX")}</div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">Acciones alta prioridad: {bnsMetrics.accionesAltaPrioridad}</div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">Acciones vencidas: {bnsMetrics.accionesVencidas}</div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">Conversión actual: {bnsMetrics.conversion}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tabActiva === "pressure" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 backdrop-blur-xl">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-red-300">ORGANIZATIONAL PRESSURE ENGINE™</p>
                    <h2 className="mt-3 text-3xl font-bold">Presión por ejecutivo, líder y área</h2>
                    <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-300">
                      Esta capa detecta saturación, dependencia, cuellos de botella y presión operativa que puede afectar revenue, velocidad de decisión y forecast.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                    <p className="text-xs tracking-[0.25em] text-gray-400">PRESIÓN PROMEDIO</p>
                    <h3 className="mt-2 text-4xl font-bold text-red-300">{safePercent(pressureEngine.promedio)}%</h3>
                    <p className="mt-2 text-xs text-gray-400">{pressureEngine.estadoGeneral}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
                <p className="text-sm tracking-[0.3em] text-cyan-300">SEÑAL PRINCIPAL</p>
                <h3 className="mt-3 text-2xl font-bold">{pressureEngine.señalPrincipal}</h3>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {pressureEngine.items.length === 0 ? (
                  <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6 text-sm text-yellow-200 xl:col-span-3">
                    Agrega ejecutivos, líderes, leads y acciones para activar el mapa de presión organizacional.
                  </div>
                ) : (
                  pressureEngine.items.map((item) => (
                    <div key={`${item.tipo}-${item.nombre}`} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs tracking-[0.25em] text-gray-500">{item.tipo}</p>
                          <h3 className="mt-2 text-2xl font-bold text-white">{item.nombre}</h3>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs ${item.estado === "Saturación" ? "bg-red-500/10 text-red-300" : item.estado === "Presión" ? "bg-yellow-500/10 text-yellow-300" : "bg-green-500/10 text-green-300"}`}>
                          {item.estado}
                        </span>
                      </div>
                      <div className="mt-5 flex items-end gap-2">
                        <p className={`text-5xl font-bold ${item.estado === "Saturación" ? "text-red-300" : item.estado === "Presión" ? "text-yellow-300" : "text-green-300"}`}>{item.score}</p>
                        <p className="mb-2 text-sm text-gray-500">/100</p>
                      </div>
                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${item.estado === "Saturación" ? "bg-red-400" : item.estado === "Presión" ? "bg-yellow-300" : "bg-green-400"}`} style={{ width: `${item.score}%` }} />
                      </div>
                      <p className="mt-4 text-sm leading-6 text-gray-400">{item.lectura}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tabActiva === "digital" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-6">
                <p className="text-sm tracking-[0.3em] text-cyan-300">
                  DIGITAL INTELLIGENCE
                </p>

                <h3 className="mt-3 text-2xl font-bold">
                  Vista general digital de {nombreEmpresa}
                </h3>

                <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-400">
                  Esta pestaña resume la capa digital completa: sitio web,
                  redes sociales, WhatsApp, reputación y conversión digital.
                </p>
              </div>
            </div>
          )}

          {tabActiva === "liderazgo" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {tarjetaInteractiva(
                "DEPENDENCIA EJECUTIVA",
                "Moderada",
                "Decisiones comerciales, operativas o de aprobación concentradas en dirección.",
                "text-yellow-400",
                "Hoy simulado. Después se medirá con responsables, aprobaciones y tiempos de espera.",
                "Delegar decisiones repetitivas y crear criterios claros de autorización."
              )}

              {tarjetaInteractiva(
                "VELOCIDAD DE DECISIÓN",
                "74%",
                "Tiempo en que la empresa pasa de detectar un problema a tomar acción.",
                "text-green-400",
                "Hoy simulado. Después saldrá de tareas, aprobaciones y cambios de etapa.",
                "Automatizar recordatorios, aprobaciones simples y alertas ejecutivas."
              )}

              {tarjetaInteractiva(
                "SATURACIÓN GERENCIAL",
                "Alta",
                "Carga acumulada de coordinación, seguimiento y resolución en mandos medios.",
                "text-red-400",
                "Hoy simulado. Después se medirá con tareas asignadas, retrasos y dependencias.",
                "Redistribuir carga y automatizar reportes operativos."
              )}
            </div>
          )}

          {tabActiva === "senales" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {[
                ["Operaciones", "Carga operativa creciente", "+31%", "text-yellow-400"],
                ["Ingresos", "Pipeline estable con riesgo moderado", "$4.2M", "text-cyan-400"],
                ["Liderazgo", "Decisiones concentradas en dirección", "Media", "text-red-400"],
                ["Instagram", "Pico de interacción detectado", "+18%", "text-green-400"],
                ["WhatsApp", "Retraso de respuesta comercial", "+42%", "text-red-400"],
                ["Sitio Web", "Fricción de conversión detectada", "Media", "text-yellow-400"],
              ].map(([canal, descripcion, valor, color]) => (
                <div
                  key={canal}
                  className="rounded-3xl border border-cyan-500/20 bg-white/5 p-6 backdrop-blur-xl"
                >
                  <p className="text-sm tracking-[0.3em] text-cyan-300">
                    {canal}
                  </p>

                  <h3 className="mt-3 text-xl font-bold">{descripcion}</h3>

                  <p className={`mt-4 text-3xl font-bold ${color}`}>
                    {valor}
                  </p>

                  <p className="mt-4 text-xs text-yellow-300">
                    Dato simulado / pendiente de conexión
                  </p>
                </div>
              ))}
            </div>
          )}

          {tabActiva === "sitio" && (
            <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm tracking-[0.3em] text-cyan-300">
                    INTELIGENCIA WEB™
                  </p>

                  <h3 className="mt-3 text-2xl font-bold">
                    Análisis del sitio web de {nombreEmpresa}
                  </h3>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
                    Esta pestaña analiza únicamente el sitio web: claridad
                    comercial, fricción de contacto, estructura de conversión y
                    riesgo de abandono.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border px-3 py-2 text-[11px] ${
                    analizando
                      ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                      : analizado
                      ? "border-green-500/20 bg-green-500/10 text-green-300"
                      : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                  }`}
                >
                  {analizando
                    ? mensajeAnalisis
                    : analizado
                    ? "Análisis completado"
                    : "Listo para analizar"}
                </div>
              </div>

              <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/30 p-5 lg:flex-row">
                <input
                  type="text"
                  value={url || empresa.sitio}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://www.empresa.com"
                  className="flex-1 rounded-2xl border border-cyan-500/20 bg-black/60 px-5 py-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-cyan-400"
                />

                <button
                  onClick={analizarSitio}
                  disabled={analizando}
                  className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-8 py-4 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {analizando ? "Analizando..." : "Analizar sitio"}
                </button>
              </div>

              {analizado && (
                <div className="mb-8 space-y-6">
                  <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="text-sm tracking-[0.3em] text-cyan-300">
                          SITIO ANALIZADO
                        </p>

                        <h4 className="mt-3 text-2xl font-bold text-white">
                          {url || empresa.sitio}
                        </h4>

                        <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-300">
                          BNS detectó señales de fricción moderada en la
                          experiencia digital. La propuesta de valor puede
                          fortalecerse y el flujo de conversión presenta
                          oportunidades importantes de optimización.
                        </p>
                      </div>

                      <button
                        onClick={descargarPDF}
                        className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                      >
                        Descargar PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-sm text-gray-400">Claridad comercial</p>
                  <h4 className="mt-2 text-2xl font-bold text-cyan-400">
                    {analizado ? "68%" : "74%"}
                  </h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-sm text-gray-400">Fricción de contacto</p>
                  <h4 className="mt-2 text-2xl font-bold text-yellow-400">
                    Media
                  </h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-sm text-gray-400">Botones de WhatsApp</p>
                  <h4 className="mt-2 text-2xl font-bold text-green-400">
                    Detectado
                  </h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-sm text-gray-400">Riesgo de abandono</p>
                  <h4 className="mt-2 text-2xl font-bold text-red-400">
                    {analizado ? "39%" : "31%"}
                  </h4>
                </div>
              </div>
            </div>
          )}

          {tabActiva === "redes" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-6">
                  <p className="text-sm tracking-[0.3em] text-green-300">
                    INSTAGRAM
                  </p>

                  <h3 className="mt-3 text-xl font-bold">Ritmo positivo</h3>

                  <p className="mt-4 text-3xl font-bold text-green-400">+18%</p>

                  <p className="mt-4 text-sm leading-6 text-gray-300">
                    Consejo: continuar con contenido visual, testimonios y
                    llamados claros a WhatsApp.
                  </p>
                </div>

                <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
                  <p className="text-sm tracking-[0.3em] text-yellow-300">
                    FACEBOOK
                  </p>

                  <h3 className="mt-3 text-xl font-bold">Conversación mixta</h3>

                  <p className="mt-4 text-3xl font-bold text-yellow-400">
                    12 alertas
                  </p>

                  <p className="mt-4 text-sm leading-6 text-gray-300">
                    Consejo: responder dudas frecuentes y convertir comentarios
                    en oportunidades.
                  </p>
                </div>

                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
                  <p className="text-sm tracking-[0.3em] text-cyan-300">
                    SENTIMIENTO GENERAL
                  </p>

                  <h3 className="mt-3 text-xl font-bold">
                    Positivo con vigilancia
                  </h3>

                  <p className="mt-4 text-3xl font-bold text-cyan-400">74%</p>

                  <p className="mt-4 text-sm leading-6 text-gray-300">
                    Consejo: mantener consistencia, publicar casos reales y
                    monitorear comentarios negativos.
                  </p>
                </div>
              </div>

              <p className="text-xs text-yellow-300">
                Datos simulados. Pendiente conexión a APIs o carga manual.
              </p>
            </div>
          )}

          {tabActiva === "whatsapp" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
                <p className="text-sm tracking-[0.3em] text-yellow-300">
                  WHATSAPP NO CONECTADO
                </p>

                <h3 className="mt-4 text-2xl font-bold">
                  Las métricas actuales son demostrativas
                </h3>

                <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-300">
                  BNS todavía no tiene acceso real al WhatsApp de la empresa.
                  Para medir retrasos, leads sin atender e intensidad comercial,
                  debemos conectar WhatsApp Business API o iniciar con carga
                  manual en Supabase.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {tarjetaInteractiva(
                  "RETRASO DE RESPUESTA",
                  "+42%",
                  "Tiempo estimado de demora comercial. Hoy es demostrativo.",
                  "text-red-400",
                  "No conectado. Requiere WhatsApp Business API o carga manual.",
                  "Conectar WhatsApp o registrar conversaciones en Supabase."
                )}

                {tarjetaInteractiva(
                  "LEADS SIN ATENDER",
                  "14",
                  "Conversaciones potenciales pendientes de respuesta.",
                  "text-yellow-400",
                  "No conectado. Es simulación de comportamiento.",
                  "Crear tablero de leads y estado de seguimiento."
                )}

                {tarjetaInteractiva(
                  "INTENSIDAD COMERCIAL",
                  "Alta",
                  "Volumen estimado de conversación comercial.",
                  "text-green-400",
                  "No conectado. Pendiente fuente real.",
                  "Medir mensajes entrantes, respuestas y cierres."
                )}
              </div>
            </div>
          )}

          {tabActiva === "diagnostico" && (
            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8">
              <p className="text-sm tracking-[0.3em] text-cyan-300">DIAGNOSIS UNIFICADO</p>
              <h2 className="mt-3 text-3xl font-bold">Este módulo ahora vive dentro de Executive Intelligence™</h2>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-300">
                Diagnóstico IA, riesgos, FODA, memoria, predicción y acciones se consolidaron en una sola inteligencia central para evitar duplicidad.
              </p>
              <button
                onClick={() => {
                  setIntelligenceView("diagnosis");
                  setTabActiva("intelligence");
                }}
                className="mt-6 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-100"
              >
                Abrir Executive Intelligence™
              </button>
            </div>
          )}


          {tabActiva === "strategic" && (
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/10 p-8 backdrop-blur-xl">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
                      STRATEGY INTELLIGENCE™
                    </p>
                    <h2 className="mt-3 text-3xl font-black">
                      Análisis estratégico integral
                    </h2>
                    <p className="mt-4 max-w-5xl text-sm leading-6 text-gray-300">
                      BNS™ cruza operación, revenue, presión, forecast y liderazgo con frameworks estratégicos para traducir diagnóstico en decisión ejecutiva.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-red-300">Riesgo</p>
                      <p className="mt-1 text-3xl font-black text-red-200">{safeNumber(strategicIntelligence.strategicRiskScore)}</p>
                    </div>
                    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-300">Externo</p>
                      <p className="mt-1 text-3xl font-black text-yellow-200">{safeNumber(strategicIntelligence.externalPressureScore)}</p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Alineación</p>
                      <p className="mt-1 text-3xl font-black text-cyan-200">{safeNumber(strategicIntelligence.internalAlignmentScore)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Conclusión ejecutiva</p>
                  <p className="mt-2 text-lg font-bold leading-8 text-white">
                    {strategicIntelligence.conclusion}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-[2rem] border border-cyan-500/20 bg-white/[0.035] p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                    EXTERNAL PRESSURE INTELLIGENCE™
                  </p>
                  <h3 className="mt-3 text-3xl font-black">PESTEL vivo</h3>
                  <div className="mt-5 space-y-3">
                    {strategicIntelligence.pestel.map((item) => (
                      <div key={item.factor} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold text-white">{item.factor}</p>
                          <span className={`rounded-full px-2 py-1 text-[10px] ${
                            item.impacto === "Alto"
                              ? "bg-red-500/10 text-red-300"
                              : "bg-yellow-500/10 text-yellow-300"
                          }`}>
                            {item.impacto}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-400">{item.lectura}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-yellow-500/20 bg-yellow-500/5 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">
                    COMPETITIVE DOMINANCE ENGINE™
                  </p>
                  <h3 className="mt-3 text-3xl font-black">5 Fuerzas de Porter</h3>
                  <div className="mt-5 space-y-3">
                    {strategicIntelligence.porter.map((item) => (
                      <div key={item.fuerza} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold text-white">{item.fuerza}</p>
                          <span className={`rounded-full px-2 py-1 text-[10px] ${
                            item.intensidad === "Alta"
                              ? "bg-red-500/10 text-red-300"
                              : "bg-cyan-500/10 text-cyan-300"
                          }`}>
                            {item.intensidad}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-400">{item.lectura}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-[2rem] border border-green-500/20 bg-green-500/5 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-green-300">
                    OPERATIONAL FRICTION MAP™
                  </p>
                  <h3 className="mt-3 text-3xl font-black">Cadena de valor</h3>
                  <div className="mt-5 space-y-3">
                    {strategicIntelligence.valueChain.map((item) => (
                      <div key={item.actividad} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold text-white">{item.actividad}</p>
                          <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-gray-300">
                            {item.estado}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-400">{item.lectura}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/5 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
                    ORGANIZATIONAL ALIGNMENT ENGINE™
                  </p>
                  <h3 className="mt-3 text-3xl font-black">7S McKinsey</h3>
                  <div className="mt-5 grid grid-cols-1 gap-3">
                    {strategicIntelligence.mckinsey7s.map((item) => (
                      <div key={item.s} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold text-white">{item.s}</p>
                          <span className={`rounded-full px-2 py-1 text-[10px] ${
                            item.alineacion === "Alta"
                              ? "bg-green-500/10 text-green-300"
                              : item.alineacion === "Baja"
                              ? "bg-red-500/10 text-red-300"
                              : "bg-yellow-500/10 text-yellow-300"
                          }`}>
                            {item.alineacion}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-400">{item.lectura}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-red-300">
                    EXECUTIVE INTERVENTION ENGINE™
                  </p>
                  <h3 className="mt-3 text-3xl font-black">Matriz CAME</h3>
                  <div className="mt-5 grid grid-cols-1 gap-3">
                    {strategicIntelligence.came.map((item) => (
                      <div key={item.tipo} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-red-300">{item.tipo} • {item.origen}</p>
                        <p className="mt-2 text-sm leading-6 text-gray-300">{item.accion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/5 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                    GROWTH INTELLIGENCE LAYER™
                  </p>
                  <h3 className="mt-3 text-3xl font-black">SOAR</h3>
                  <div className="mt-5 grid grid-cols-1 gap-3">
                    {strategicIntelligence.soar.map((item) => (
                      <div key={item.eje} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{item.eje}</p>
                        <p className="mt-2 text-sm leading-6 text-gray-300">{item.lectura}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tabActiva === "memory" && (
            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8">
              <p className="text-sm tracking-[0.3em] text-cyan-300">MEMORY UNIFICADO</p>
              <h2 className="mt-3 text-3xl font-bold">Memoria empresarial ahora vive dentro de Executive Intelligence™</h2>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-300">
                BNS™ usará memoria como capa de patrones históricos, no como módulo aislado.
              </p>
              <button
                onClick={() => {
                  setIntelligenceView("memory");
                  setTabActiva("intelligence");
                }}
                className="mt-6 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-100"
              >
                Abrir Memory dentro de Executive Intelligence™
              </button>
            </div>
          )}

          {tabActiva === "boardroom" && (
            <div className="relative -mx-6 -my-6 min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2.5rem] border border-cyan-500/20 bg-black p-8 xl:-mx-8 xl:-my-8 xl:p-10">
              <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="pointer-events-none absolute bottom-[-220px] right-[-120px] h-[620px] w-[620px] rounded-full bg-purple-500/15 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

              <div className="relative z-10">
                <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.95)]" />
                      Boardroom Mode™
                    </div>

                    <h2 className="max-w-5xl text-3xl font-black leading-[1.02] tracking-tight xl:text-5xl">
                      {signalEventEngine.estado === "Critical"
                        ? "Executive intervention required."
                        : signalEventEngine.estado === "Watch"
                        ? "Executive attention required."
                        : "Enterprise operating rhythm stable."}
                    </h2>

                    <p className="mt-6 max-w-4xl text-lg leading-8 text-gray-400">
                      {signalEventEngine.lectura}
                    </p>
                  </div>

                  <div
                    className={`rounded-[2rem] border p-6 text-right ${
                      signalEventEngine.estado === "Critical"
                        ? "border-red-500/25 bg-red-500/10"
                        : signalEventEngine.estado === "Watch"
                        ? "border-yellow-500/25 bg-yellow-500/10"
                        : "border-green-500/25 bg-green-500/10"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">System Status</p>
                    <h3
                      className={`mt-3 text-3xl font-black ${
                        signalEventEngine.estado === "Critical"
                          ? "text-red-300"
                          : signalEventEngine.estado === "Watch"
                          ? "text-yellow-300"
                          : "text-green-300"
                      }`}
                    >
                      {signalEventEngine.estado}
                    </h3>
                    <p className="mt-3 text-sm text-gray-400">
                      {signalEventEngine.criticos} critical • {signalEventEngine.altos} high
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
                  <div className="rounded-[1.7rem] border border-cyan-500/20 bg-cyan-500/10 p-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">Enterprise Health</p>
                    <h3 className="mt-3 text-4xl font-black text-cyan-200">{bnsMetrics.bnsScore}</h3>
                  </div>

                  <div className="rounded-[1.7rem] border border-green-500/20 bg-green-500/10 p-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-green-300">Revenue Forecast</p>
                    <h3 className="mt-3 text-4xl font-black text-green-200">{safePercent(forecastIntelligence.confianza)}%</h3>
                  </div>

                  <div className="rounded-[1.7rem] border border-yellow-500/20 bg-yellow-500/10 p-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-300">Pressure</p>
                    <h3 className="mt-3 text-4xl font-black text-yellow-200">{safePercent(pressureEngine.promedio)}%</h3>
                  </div>

                  <div className="rounded-[1.7rem] border border-red-500/20 bg-red-500/10 p-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-red-300">Critical Signals</p>
                    <h3 className="mt-3 text-4xl font-black text-red-200">{signalEventEngine.eventos.length}</h3>
                  </div>

                  <div className="rounded-[1.7rem] border border-purple-500/20 bg-purple-500/10 p-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-purple-300">AI Brief</p>
                    <h3 className="mt-3 text-lg font-black text-purple-200">
                      {groqGenerando ? "Thinking" : groqRespuesta ? "Ready" : "Standby"}
                    </h3>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Live Enterprise Critical Signals™</p>
                        <h3 className="mt-2 text-3xl font-black">Señales generadas por BNS™</h3>
                      </div>
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                        Rule Engine
                      </span>
                    </div>

                    <div className="space-y-4">
                      {signalEventEngine.eventos.slice(0, 6).map((evento) => (
                        <div
                          key={evento.id}
                          className={`rounded-3xl border p-5 ${
                            evento.severidad === "Crítica"
                              ? "border-red-500/25 bg-red-500/10"
                              : evento.severidad === "Alta"
                              ? "border-yellow-500/25 bg-yellow-500/10"
                              : evento.severidad === "Media"
                              ? "border-cyan-500/20 bg-cyan-500/10"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  evento.severidad === "Crítica"
                                    ? "bg-red-300 shadow-[0_0_16px_rgba(248,113,113,0.9)]"
                                    : evento.severidad === "Alta"
                                    ? "bg-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.9)]"
                                    : "bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)]"
                                }`}
                              />
                              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                                {evento.tipo} • {evento.severidad}
                              </p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] text-gray-400">
                              Impact: {evento.impacto}
                            </span>
                          </div>
                          <h4 className="mt-3 text-lg font-black text-white">{evento.titulo}</h4>
                          <p className="mt-2 text-sm leading-6 text-gray-300">{evento.descripcion}</p>
                          <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-cyan-100">
                            Recommended intervention: {evento.accion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/10 p-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-purple-300">AI Executive Brief™</p>
                      <h3 className="mt-3 text-3xl font-black">Lectura para dirección</h3>
                      <p className="mt-4 text-sm leading-7 text-gray-200">
                        {groqRespuesta
                          ? groqRespuesta.slice(0, 850)
                          : aiCopilot.recomendacionPrincipal}
                      </p>
                      <button
                        type="button"
                        onClick={generarDiagnosticoGroq}
                        disabled={groqGenerando}
                        className="mt-5 rounded-2xl border border-purple-400/30 bg-purple-400/15 px-5 py-3 text-sm font-bold text-purple-100 transition hover:bg-purple-400/25 disabled:opacity-60"
                      >
                        {groqGenerando ? "Analizando..." : "Generate Executive Brief"}
                      </button>
                    </div>

                    <div className="rounded-[2rem] border border-green-500/20 bg-green-500/10 p-6">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.3em] text-green-300">Realtime Enterprise Feed™</p>
                          <h3 className="mt-3 text-3xl font-black">Pulso vivo</h3>
                        </div>
                        <span className="rounded-full border border-green-500/20 bg-black/30 px-3 py-1 text-xs text-green-300">
                          {liveEvents.length} eventos
                        </span>
                      </div>

                      {liveEvents.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-gray-400">
                          Aún no hay eventos vivos. Importa CSV, genera IA o espera cambios de Supabase Realtime.
                        </div>
                      ) : (
                        <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
                          {liveEvents.slice(0, 8).map((evento) => (
                            <div
                              key={evento.id}
                              className={`rounded-2xl border p-4 ${
                                evento.severidad === "Alta"
                                  ? "border-red-500/20 bg-red-500/10"
                                  : evento.severidad === "Media"
                                  ? "border-yellow-500/20 bg-yellow-500/10"
                                  : "border-white/10 bg-black/30"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                                  {evento.tipo}
                                </p>
                                <p className="text-[10px] text-gray-500">{evento.hora}</p>
                              </div>
                              <h4 className="mt-2 text-sm font-bold text-white">{evento.titulo}</h4>
                              <p className="mt-1 text-xs leading-5 text-gray-400">{evento.descripcion}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-[2rem] border border-cyan-500/20 bg-black/40 p-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Neural Timeline™</p>
                      <h3 className="mt-3 text-3xl font-black">Eventos recientes</h3>

                      <div className="mt-6 space-y-4">
                        {timelineNeural.slice(0, 6).map((evento, index) => (
                          <div key={`${evento.tipo}-${evento.titulo}-${index}`} className="flex gap-4">
                            <div
                              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                                evento.severidad === "Alta"
                                  ? "bg-red-300"
                                  : evento.severidad === "Media"
                                  ? "bg-yellow-300"
                                  : "bg-cyan-300"
                              }`}
                            />
                            <div>
                              <p className="text-xs text-gray-500">{evento.hora} • {evento.tipo}</p>
                              <h4 className="mt-1 text-sm font-bold text-white">{evento.titulo}</h4>
                              <p className="mt-1 text-xs leading-5 text-gray-400">{evento.descripcion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[2rem] border border-yellow-500/20 bg-yellow-500/10 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Board Decision</p>
                    <h3 className="mt-3 text-3xl font-black">
                      {signalEventEngine.estado === "Critical"
                        ? "Intervenir ahora: forecast, presión y liderazgo requieren acción directiva."
                        : signalEventEngine.estado === "Watch"
                        ? "Activar vigilancia ejecutiva y reducir fricción antes de escalar."
                        : "Mantener monitoreo predictivo y fortalecer fuentes de datos."}
                    </h3>
                  </div>

                  <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Memory Correlation™</p>
                    <h3 className="mt-3 text-3xl font-black">{memoryCorrelationEngine.estado}</h3>
                    <p className="mt-3 text-sm leading-6 text-gray-300">{memoryCorrelationEngine.lectura}</p>
                    <p className="mt-4 text-xs text-cyan-200">
                      Patrón principal: {memoryCorrelationEngine.patrones[0]?.titulo || "Sin patrón"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Enterprise Graph™</p>
                  <h3 className="mt-3 text-3xl font-black">{enterpriseGraph.criticalNodes} critical nodes • {enterpriseGraph.watchNodes} watch nodes</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-300">{enterpriseGraph.lectura}</p>
                </div>

                <div className="mt-8 rounded-[2rem] border border-purple-500/20 bg-purple-500/10 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-purple-300">Scenario Simulator™</p>
                  <h3 className="mt-3 text-3xl font-black">{scenarioSimulator.escenarioCritico.nombre}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-300">{scenarioSimulator.escenarioCritico.lectura}</p>
                  <p className="mt-4 text-sm text-purple-100">
                    Decisión sugerida: {scenarioSimulator.decisionRecomendada}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tabActiva === "integrations" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8">
                <p className="text-sm tracking-[0.3em] text-cyan-300">INTEGRATIONS HUB™</p>
                <h2 className="mt-3 text-3xl font-bold">Fuentes e infraestructura</h2>
                <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-400">
                  Aquí vivirá la conexión real con datos, IA, CRM, WhatsApp, analítica y fuentes externas.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {[
                  ["Supabase Auth", "Pendiente", "Usuarios, sesiones y seguridad real."],
                  ["Supabase Database", "Pendiente", "Empresas, miembros, análisis e historial."],
                  ["RLS", "Pendiente", "Protección por empresa y rol."],
                  ["Groq", "Pendiente", "Diagnosis IA ejecutivo."],
                  ["WhatsApp Business", "Pendiente", "Leads, respuesta y seguimiento."],
                  ["Google Analytics / Web", "Pendiente", "Tráfico, conversión y comportamiento."],
                ].map(([nombre, estado, descripcion]) => (
                  <div key={nombre} className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
                    <p className="text-sm tracking-[0.25em] text-yellow-300">{estado}</p>
                    <h3 className="mt-3 text-2xl font-bold">{nombre}</h3>
                    <p className="mt-3 text-sm leading-6 text-gray-300">{descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabActiva === "mobile" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8">
                <p className="text-sm tracking-[0.3em] text-cyan-300">MOBILE EXECUTIVE™</p>
                <h2 className="mt-3 text-3xl font-bold">Pulso ejecutivo móvil</h2>
                <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-400">
                  En celular, BNS no debe mostrar todo el dashboard: debe mostrar lo urgente, lo accionable y lo que requiere decisión.
                </p>
              </div>

              <div className="mx-auto max-w-sm rounded-[2rem] border border-white/10 bg-black/70 p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm font-bold text-cyan-300">BNS™</p>
                  <p className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300">Pressure</p>
                </div>

                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                  <p className="text-xs text-cyan-300">BNS Index</p>
                  <h3 className="mt-2 text-5xl font-bold text-cyan-300">82</h3>
                  <p className="mt-3 text-xs text-gray-400">La empresa está funcional con presión moderada.</p>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">Seguimiento comercial requiere atención.</div>
                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">Soporte está elevando presión operativa.</div>
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-200">Ritmo digital positivo.</div>
                </div>
              </div>
            </div>
          )}

          {tabActiva === "intelligence" && (
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm tracking-[0.3em] text-cyan-300">EXECUTIVE INTELLIGENCE™</p>
                    <h2 className="mt-3 text-4xl font-black">Un solo cerebro empresarial</h2>
                    <p className="mt-4 max-w-5xl text-sm leading-6 text-gray-400">
                      Diagnóstico IA, riesgos, FODA, predicción, memoria e intervenciones ahora viven como una sola capa de interpretación para C-Level.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={generarDiagnosticoGroq}
                    disabled={groqGenerando}
                    className="rounded-2xl border border-purple-400/30 bg-purple-400/15 px-6 py-4 text-sm font-bold text-purple-100 transition hover:bg-purple-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {groqGenerando ? "Analizando..." : "Generate Executive Brief"}
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    ["diagnosis", "Diagnosis"],
                    ["risks", "Risk Critical Signals"],
                    ["prediction", "Prediction"],
                    ["strategy", "Strategy Analysis"],
                    ["memory", "Memory"],
                    ["scenarios", "Scenarios"],
                    ["actions", "Executive Actions"],
                  ].map(([view, label]) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setIntelligenceView(view as typeof intelligenceView)}
                      className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                        intelligenceView === view
                          ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-100"
                          : "border-white/10 bg-black/30 text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {groqRespuesta && (
                <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/10 p-6">
                  <p className="text-xs font-bold tracking-[0.25em] text-purple-300">LECTURA GROQ</p>
                  <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-200">
                    {groqRespuesta}
                  </div>
                </div>
              )}

              {intelligenceView === "diagnosis" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[2rem] border border-cyan-500/20 bg-black/40 p-6">
                    <p className="text-sm tracking-[0.3em] text-cyan-300">EXECUTIVE READING</p>
                    <h3 className="mt-3 text-3xl font-bold">Lectura automática BNS™</h3>
                    <p className="mt-4 text-lg leading-8 text-gray-200">{bnsIntelligence.resumenEjecutivo}</p>

                    <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
                      {bnsIntelligence.señales.map((senal) => (
                        <div key={senal.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs text-gray-500">{senal.label}</p>
                          <h4 className="mt-2 text-2xl font-bold text-cyan-300">{senal.value}</h4>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-[2rem] border p-6 ${bnsIntelligence.semaforo.bg}`}>
                    <p className="text-sm tracking-[0.3em] text-gray-400">SEMAFORO BNS™</p>
                    <h3 className={`mt-3 text-4xl font-black ${bnsIntelligence.semaforo.color}`}>{bnsIntelligence.semaforo.label}</h3>
                    <p className="mt-4 text-sm leading-6 text-gray-300">{bnsIntelligence.estadoGeneral}</p>
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-cyan-200">
                      {aiCopilot.recomendacionPrincipal}
                    </div>
                  </div>
                </div>
              )}

              {intelligenceView === "risks" && (
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm tracking-[0.3em] text-red-300">RISK INTELLIGENCE™</p>
                      <h3 className="mt-2 text-3xl font-bold">Riesgos y alertas detectadas</h3>
                    </div>
                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300">
                      {bnsIntelligence.alertas.length} activas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {bnsIntelligence.alertas.map((alerta) => (
                      <div key={`${alerta.nivel}-${alerta.titulo}`} className={`rounded-3xl border p-5 ${alerta.fondo}`}>
                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-xs font-bold tracking-[0.25em] ${alerta.color}`}>{alerta.nivel}</p>
                          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-gray-300">{alerta.area}</span>
                        </div>
                        <h4 className="mt-3 text-xl font-bold">{alerta.titulo}</h4>
                        <p className="mt-3 text-sm leading-6 text-gray-300">{alerta.descripcion}</p>
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-cyan-200">
                          Acción sugerida: {alerta.accion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {intelligenceView === "prediction" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[2rem] border border-yellow-500/20 bg-yellow-500/10 p-6">
                    <p className="text-sm tracking-[0.3em] text-yellow-300">PREDICTIVE ENGINE™</p>
                    <h3 className="mt-3 text-3xl font-bold">Riesgo predictivo: {predictiveEngine.riesgoPredictivo}</h3>
                    <p className="mt-4 text-sm leading-6 text-gray-300">{predictiveEngine.lectura}</p>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/40">
                      <div
                        className="h-full rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.7)]"
                        style={{ width: `${predictiveEngine.confianzaPredictiva}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Confianza predictiva: {predictiveEngine.confianzaPredictiva}%
                    </p>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                    <p className="text-sm tracking-[0.3em] text-cyan-300">SEÑALES PREDICTIVAS</p>
                    <h3 className="mt-2 text-2xl font-bold">Lo que BNS™ anticipa</h3>
                    <div className="mt-5 grid grid-cols-1 gap-4">
                      {predictiveEngine.señales.map((senal) => (
                        <div
                          key={`${senal.nivel}-${senal.titulo}`}
                          className={`rounded-3xl border p-5 ${
                            senal.nivel === "Alto"
                              ? "border-red-500/20 bg-red-500/10"
                              : senal.nivel === "Medio"
                              ? "border-yellow-500/20 bg-yellow-500/10"
                              : "border-green-500/20 bg-green-500/10"
                          }`}
                        >
                          <p className="text-xs font-bold tracking-[0.25em] text-cyan-300">{senal.nivel}</p>
                          <h4 className="mt-3 text-xl font-bold">{senal.titulo}</h4>
                          <p className="mt-3 text-sm leading-6 text-gray-300">{senal.descripcion}</p>
                          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-cyan-200">
                            Acción sugerida: {senal.accion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {intelligenceView === "strategy" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                    {[
                      ["FORTALEZAS", strategicAnalysis.fortalezas, "border-green-500/20 bg-green-500/10 text-green-300"],
                      ["OPORTUNIDADES", strategicAnalysis.oportunidades, "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"],
                      ["DEBILIDADES", strategicAnalysis.debilidades, "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"],
                      ["AMENAZAS", strategicAnalysis.amenazas, "border-red-500/20 bg-red-500/10 text-red-300"],
                    ].map(([titulo, items, estilo]) => (
                      <div key={titulo as string} className={`rounded-3xl border p-5 ${estilo as string}`}>
                        <p className="text-xs font-bold tracking-[0.25em]">{titulo as string}</p>
                        <div className="mt-4 space-y-3">
                          {(items as string[]).map((item) => (
                            <p key={item} className="text-sm leading-6 text-gray-300">• {item}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-6">
                    <p className="text-sm tracking-[0.3em] text-cyan-300">CONCLUSIÓN EJECUTIVA</p>
                    <p className="mt-3 text-lg leading-8 text-white">{strategicAnalysis.conclusion}</p>
                  </div>


                  <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/10 p-8 backdrop-blur-xl">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
                          STRATEGY INTELLIGENCE™
                        </p>
                        <h2 className="mt-3 text-4xl font-black">
                          Análisis estratégico integral
                        </h2>
                        <p className="mt-4 max-w-5xl text-sm leading-6 text-gray-300">
                          BNS™ cruza operación, revenue, presión, forecast y liderazgo con frameworks estratégicos para traducir diagnóstico en decisión ejecutiva.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-red-300">Riesgo</p>
                          <p className="mt-1 text-3xl font-black text-red-200">{safeNumber(strategicIntelligence.strategicRiskScore)}</p>
                        </div>
                        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-300">Externo</p>
                          <p className="mt-1 text-3xl font-black text-yellow-200">{safeNumber(strategicIntelligence.externalPressureScore)}</p>
                        </div>
                        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Alineación</p>
                          <p className="mt-1 text-3xl font-black text-cyan-200">{safeNumber(strategicIntelligence.internalAlignmentScore)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Conclusión estratégica</p>
                      <p className="mt-2 text-lg font-bold leading-8 text-white">
                        {strategicIntelligence.conclusion}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-[2rem] border border-cyan-500/20 bg-white/[0.035] p-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                        EXTERNAL PRESSURE INTELLIGENCE™
                      </p>
                      <h3 className="mt-3 text-3xl font-black">PESTEL vivo</h3>
                      <div className="mt-5 space-y-3">
                        {strategicIntelligence.pestel.map((item) => (
                          <div key={item.factor} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-bold text-white">{item.factor}</p>
                              <span className={`rounded-full px-2 py-1 text-[10px] ${
                                item.impacto === "Alto"
                                  ? "bg-red-500/10 text-red-300"
                                  : "bg-yellow-500/10 text-yellow-300"
                              }`}>
                                {item.impacto}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-gray-400">{item.lectura}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-yellow-500/20 bg-yellow-500/5 p-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">
                        COMPETITIVE DOMINANCE ENGINE™
                      </p>
                      <h3 className="mt-3 text-3xl font-black">5 Fuerzas de Porter</h3>
                      <div className="mt-5 space-y-3">
                        {strategicIntelligence.porter.map((item) => (
                          <div key={item.fuerza} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-bold text-white">{item.fuerza}</p>
                              <span className={`rounded-full px-2 py-1 text-[10px] ${
                                item.intensidad === "Alta"
                                  ? "bg-red-500/10 text-red-300"
                                  : "bg-cyan-500/10 text-cyan-300"
                              }`}>
                                {item.intensidad}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-gray-400">{item.lectura}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-[2rem] border border-green-500/20 bg-green-500/5 p-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-green-300">
                        OPERATIONAL FRICTION MAP™
                      </p>
                      <h3 className="mt-3 text-3xl font-black">Cadena de valor</h3>
                      <div className="mt-5 space-y-3">
                        {strategicIntelligence.valueChain.map((item) => (
                          <div key={item.actividad} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-bold text-white">{item.actividad}</p>
                              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-gray-300">
                                {item.estado}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-gray-400">{item.lectura}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/5 p-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
                        ORGANIZATIONAL ALIGNMENT ENGINE™
                      </p>
                      <h3 className="mt-3 text-3xl font-black">7S McKinsey</h3>
                      <div className="mt-5 grid grid-cols-1 gap-3">
                        {strategicIntelligence.mckinsey7s.map((item) => (
                          <div key={item.s} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-bold text-white">{item.s}</p>
                              <span className={`rounded-full px-2 py-1 text-[10px] ${
                                item.alineacion === "Alta"
                                  ? "bg-green-500/10 text-green-300"
                                  : item.alineacion === "Baja"
                                  ? "bg-red-500/10 text-red-300"
                                  : "bg-yellow-500/10 text-yellow-300"
                              }`}>
                                {item.alineacion}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-gray-400">{item.lectura}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-red-300">
                        EXECUTIVE INTERVENTION ENGINE™
                      </p>
                      <h3 className="mt-3 text-3xl font-black">Matriz CAME</h3>
                      <div className="mt-5 grid grid-cols-1 gap-3">
                        {strategicIntelligence.came.map((item) => (
                          <div key={item.tipo} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-red-300">{item.tipo} • {item.origen}</p>
                            <p className="mt-2 text-sm leading-6 text-gray-300">{item.accion}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/5 p-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                        GROWTH INTELLIGENCE LAYER™
                      </p>
                      <h3 className="mt-3 text-3xl font-black">SOAR</h3>
                      <div className="mt-5 grid grid-cols-1 gap-3">
                        {strategicIntelligence.soar.map((item) => (
                          <div key={item.eje} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{item.eje}</p>
                            <p className="mt-2 text-sm leading-6 text-gray-300">{item.lectura}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {intelligenceView === "memory" && (
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="text-sm tracking-[0.3em] text-cyan-300">ENTERPRISE MEMORY™</p>
                        <h3 className="mt-3 text-3xl font-black">{memoryCorrelationEngine.estado}</h3>
                        <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-300">
                          {memoryCorrelationEngine.lectura}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/30 p-5 text-right">
                        <p className="text-xs tracking-[0.25em] text-gray-500">MEMORY INDEX</p>
                        <h4 className="mt-2 text-4xl font-black text-cyan-300">
                          {safeNumber(memoryCorrelationEngine.indiceMemoria)}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {memoryCorrelationEngine.patrones.map((patron) => (
                      <div
                        key={patron.titulo}
                        className={`rounded-3xl border p-6 ${
                          patron.severidad === "Alta"
                            ? "border-red-500/20 bg-red-500/10"
                            : patron.severidad === "Media"
                            ? "border-yellow-500/20 bg-yellow-500/10"
                            : "border-cyan-500/20 bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold tracking-[0.25em] text-cyan-300">
                              CORRELACIÓN • {patron.severidad}
                            </p>
                            <h4 className="mt-3 text-2xl font-bold">{patron.titulo}</h4>
                          </div>
                          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-cyan-300">
                            {patron.similitud}% match
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-gray-300">{patron.descripcion}</p>

                        <div className="mt-5 space-y-2">
                          {patron.evidencia.map((item) => (
                            <div key={item} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-gray-300">
                              {item}
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                          Acción recomendada: {patron.accion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {intelligenceView === "scenarios" && (
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/10 p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="text-sm tracking-[0.3em] text-purple-300">SCENARIO SIMULATOR™</p>
                        <h3 className="mt-3 text-3xl font-black">Simulación para C-Level</h3>
                        <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-300">
                          BNS™ proyecta escenarios ejecutivos a partir de forecast, presión, señales críticas y dependencia organizacional.
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/30 p-5 text-right">
                        <p className="text-xs tracking-[0.25em] text-gray-500">DECISIÓN SUGERIDA</p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-cyan-200">{scenarioSimulator.decisionRecomendada}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {scenarioSimulator.escenarios.map((escenario) => (
                      <div
                        key={escenario.id}
                        className={`rounded-3xl border p-6 ${
                          escenario.riesgo === "Crítico"
                            ? "border-red-500/20 bg-red-500/10"
                            : escenario.riesgo === "Alto"
                            ? "border-yellow-500/20 bg-yellow-500/10"
                            : escenario.riesgo === "Medio"
                            ? "border-cyan-500/20 bg-cyan-500/10"
                            : "border-green-500/20 bg-green-500/10"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold tracking-[0.25em] text-cyan-300">ESCENARIO</p>
                            <h4 className="mt-3 text-2xl font-bold">{escenario.nombre}</h4>
                          </div>
                          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-gray-300">
                            Riesgo: {escenario.riesgo}
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-gray-300">{escenario.hipotesis}</p>

                        <div className="mt-5 grid grid-cols-3 gap-3">
                          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                            <p className="text-[10px] text-gray-500">BNS</p>
                            <p className="mt-1 text-lg font-black text-cyan-300">{escenario.bns}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                            <p className="text-[10px] text-gray-500">Pressure</p>
                            <p className="mt-1 text-lg font-black text-yellow-300">{escenario.pressure}%</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                            <p className="text-[10px] text-gray-500">Revenue Forecast</p>
                            <p className="mt-1 text-lg font-black text-green-300">{escenario.forecast}%</p>
                          </div>
                        </div>

                        <p className="mt-5 text-sm leading-6 text-gray-300">{escenario.lectura}</p>

                        <div className="mt-5 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-sm text-purple-100">
                          Decisión: {escenario.decision}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {intelligenceView === "actions" && (
                <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/10 p-6">
                  <p className="text-sm tracking-[0.3em] text-purple-300">INTERVENTION LAYER™</p>
                  <h3 className="mt-3 text-3xl font-bold">Qué debe hacer dirección</h3>
                  <div className="mt-5 space-y-3">
                    {bnsIntelligence.recomendaciones.map((recomendacion) => (
                      <div key={recomendacion} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-gray-300">
                        {recomendacion}
                      </div>
                    ))}
                    {aiCopilot.respuestas.map((item) => (
                      <div key={item.pregunta} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-sm font-bold text-cyan-300">{item.pregunta}</p>
                        <p className="mt-2 text-sm leading-6 text-gray-300">{item.respuesta}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tabActiva === "crisis" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {tarjetaInteractiva(
                "RIESGO COMERCIAL",
                "31%",
                "Riesgo moderado por conversión, seguimiento y leads no atendidos.",
                "text-red-400",
                "Hoy simulado. Después usará CRM, WhatsApp y formularios.",
                "Crear alertas cuando un lead pase demasiado tiempo sin seguimiento."
              )}

              {tarjetaInteractiva(
                "PRESIÓN OPERATIVA",
                "Moderada",
                "La presión se concentra en soporte y respuesta comercial.",
                "text-yellow-400",
                "Hoy simulado. Después se conectará a tickets y tareas.",
                "Activar protocolos cuando suba la carga de soporte."
              )}

              {tarjetaInteractiva(
                "REFLEJO BNS™",
                "Activo",
                "Capacidad del sistema para detectar señales tempranas.",
                "text-cyan-400",
                "Hoy simulado. Después será motor de alertas reales.",
                "Crear reglas de alerta y umbrales de riesgo."
              )}
            </div>
          )}


          {tabActiva === "centro" && (
          <div className="rounded-[2rem] border border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.035),rgba(255,255,255,0.014))] p-6 backdrop-blur-xl shadow-[0_0_70px_rgba(34,211,238,0.05)]">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">BNS™ Executive Operating Model</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">De dashboard a sistema nervioso ejecutivo</h2>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-400">
                  Esta capa organiza los campos madre de BNS™ para pasar de visualización a interpretación: señales, presión,
                  forecast, inteligencia, acciones, memoria, integraciones, gobierno y auditoría.
                </p>
              </div>

              <button
                onClick={() =>
                  abrirDetalle({
                    titulo: "BNS™ Executive Operating Model",
                    valor: "10 capas",
                    descripcion: "Arquitectura ejecutiva que convierte señales operativas, comerciales y organizacionales en decisiones accionables.",
                    fuente: "BNS™ Command Center",
                    accion: "Usar esta estructura como mapa maestro para priorizar integraciones, módulos y automatizaciones.",
                  })
                }
                className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-500/20"
              >
                Ver modelo
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                {
                  name: "Signals",
                  value: "Alertas vivas",
                  desc: "Detecta eventos críticos antes de que se conviertan en pérdida, fricción o retraso.",
                  color: "cyan",
                  items: ["Origen", "Área", "Prioridad", "Impacto", "Responsable"],
                },
                {
                  name: "Pressure",
                  value: "Tensión organizacional",
                  desc: "Mide carga, saturación, cuellos de botella, dependencia y fricción humana.",
                  color: "yellow",
                  items: ["Área", "Nivel", "Causa", "Riesgo", "Ventana"],
                },
                {
                  name: "Forecast",
                  value: "Caja y cumplimiento",
                  desc: "Interpreta pipeline, probabilidad, desviación contra meta y riesgo comercial.",
                  color: "emerald",
                  items: ["Pipeline", "Meta", "Gap", "Confianza", "Escenario"],
                },
                {
                  name: "Intelligence",
                  value: "Interpretación IA",
                  desc: "Convierte datos en diagnóstico ejecutivo, estrategia, escenarios y lectura C-Level.",
                  color: "purple",
                  items: ["Diagnóstico", "FODA", "PESTEL", "Porter", "7S"],
                },
                {
                  name: "Actions",
                  value: "Intervenciones",
                  desc: "Traduce señales en acciones con dueño, fecha, prioridad, estado e impacto esperado.",
                  color: "rose",
                  items: ["Acción", "Owner", "Fecha", "Estado", "Resultado"],
                },
              ].map((layer) => {
                const styles =
                  layer.color === "cyan"
                    ? "border-cyan-500/20 bg-cyan-500/[0.05] text-cyan-300"
                    : layer.color === "yellow"
                      ? "border-yellow-500/20 bg-yellow-500/[0.05] text-yellow-300"
                      : layer.color === "emerald"
                        ? "border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-300"
                        : layer.color === "purple"
                          ? "border-purple-500/20 bg-purple-500/[0.05] text-purple-300"
                          : "border-rose-500/20 bg-rose-500/[0.05] text-rose-300";

                return (
                  <button
                    key={layer.name}
                    onClick={() =>
                      abrirDetalle({
                        titulo: layer.name,
                        valor: layer.value,
                        descripcion: layer.desc,
                        fuente: "BNS™ Executive Operating Model",
                        accion: `Campos principales: ${layer.items.join(", ")}.`,
                      })
                    }
                    className={`rounded-3xl border p-4 text-left transition hover:-translate-y-1 hover:bg-white/[0.045] ${styles}`}
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.2em]">{layer.name}</p>
                    <p className="mt-3 text-lg font-black text-white">{layer.value}</p>
                    <p className="mt-2 min-h-[60px] text-xs leading-5 text-gray-500">{layer.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {layer.items.map((item) => (
                        <span key={item} className="rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/50">
                          {item}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-5">
              {[
                {
                  name: "Memory",
                  value: "Historial ejecutivo",
                  desc: "Recuerda patrones, decisiones, señales repetidas y resultados anteriores.",
                  color: "purple",
                  fields: "evento, patrón, fecha, resultado, recurrencia",
                },
                {
                  name: "Boardroom",
                  value: "Decisión C-Level",
                  desc: "Resume qué debe decidir Dirección hoy y cuál es el impacto esperado.",
                  color: "yellow",
                  fields: "decisión, urgencia, impacto, escenario, recomendación",
                },
                {
                  name: "Integrations",
                  value: "Fuentes vivas",
                  desc: "Conecta WhatsApp, CRM, email, calendario, analytics, ERP y APIs.",
                  color: "cyan",
                  fields: "fuente, estado, frecuencia, permisos, última sincronización",
                },
                {
                  name: "Governance",
                  value: "Control ejecutivo",
                  desc: "Define roles, permisos, empresa activa, acceso por nivel y RLS.",
                  color: "emerald",
                  fields: "usuario, rol, empresa, permisos, alcance",
                },
                {
                  name: "Audit",
                  value: "Trazabilidad",
                  desc: "Registra navegación, cambios, IA, reportes, documentos y actividad crítica.",
                  color: "rose",
                  fields: "actor, evento, módulo, severidad, timestamp",
                },
              ].map((layer) => {
                const styles =
                  layer.color === "cyan"
                    ? "border-cyan-500/20 bg-cyan-500/[0.05] text-cyan-300"
                    : layer.color === "yellow"
                      ? "border-yellow-500/20 bg-yellow-500/[0.05] text-yellow-300"
                      : layer.color === "emerald"
                        ? "border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-300"
                        : layer.color === "purple"
                          ? "border-purple-500/20 bg-purple-500/[0.05] text-purple-300"
                          : "border-rose-500/20 bg-rose-500/[0.05] text-rose-300";

                return (
                  <button
                    key={layer.name}
                    onClick={() =>
                      abrirDetalle({
                        titulo: layer.name,
                        valor: layer.value,
                        descripcion: layer.desc,
                        fuente: "BNS™ Executive Operating Model",
                        accion: `Campos sugeridos: ${layer.fields}.`,
                      })
                    }
                    className={`rounded-3xl border p-4 text-left transition hover:-translate-y-1 hover:bg-white/[0.045] ${styles}`}
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.2em]">{layer.name}</p>
                    <p className="mt-3 text-lg font-black text-white">{layer.value}</p>
                    <p className="mt-2 text-xs leading-5 text-gray-500">{layer.desc}</p>
                    <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3 text-[10px] leading-5 text-white/45">
                      {layer.fields}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl border border-cyan-500/15 bg-cyan-500/[0.04] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Regla de producto BNS™</p>
              <p className="mt-3 text-lg font-black leading-7 text-white">
                Cada módulo debe responder tres preguntas: qué señal existe, por qué importa y qué acción ejecutiva debe tomarse.
              </p>
            </div>
          </div>

          )}

          <footer className="mt-auto pt-10">
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <p className="text-sm text-gray-500">
                BNS™ • Sistema Nervioso Empresarial
              </p><p className="text-sm text-cyan-400">Powered by BNS™</p>
            </div>
          </footer>
        </div>
      </section>

      {detalleActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-cyan-500/20 bg-black p-8 shadow-2xl">
            <p className="text-sm tracking-[0.3em] text-cyan-300">
              DETALLE BNS™
            </p>

            <h2 className="mt-4 text-3xl font-bold">{detalleActivo.titulo}</h2>

            <p className="mt-3 text-4xl font-bold text-cyan-400">
              {detalleActivo.valor}
            </p>

            <p className="mt-5 text-sm leading-6 text-gray-300">
              {detalleActivo.descripcion}
            </p>

            <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="text-sm font-semibold text-yellow-300">
                Fuente del dato
              </p>

              <p className="mt-2 text-sm text-gray-300">{detalleActivo.fuente}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-sm font-semibold text-green-300">
                Acción recomendada
              </p>

              <p className="mt-2 text-sm text-gray-300">{detalleActivo.accion}</p>
            </div>

            <button
              onClick={() => setDetalleActivo(null)}
              className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-sm font-bold text-cyan-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {documentoActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-3xl rounded-3xl border border-cyan-500/20 bg-black p-8 shadow-2xl">
            <p className="text-sm tracking-[0.3em] text-cyan-300">
              DOCUMENTO BNS™
            </p>

            <h2 className="mt-4 text-3xl font-bold">{documentoActivo.titulo}</h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              {documentoActivo.descripcion}
            </p>

            <div className="mt-6 space-y-3">
              {documentoActivo.contenido.map((linea) => (
                <div
                  key={linea}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300"
                >
                  {linea}
                </div>
              ))}
            </div>

            <button
              onClick={() => setDocumentoActivo(null)}
              className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-sm font-bold text-cyan-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
