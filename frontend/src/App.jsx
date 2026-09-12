
import React, {useEffect, useMemo, useState} from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { Activity, AlertTriangle, BarChart3, Building2, ChevronRight, Database, Droplets, Gauge, HeartPulse, Info, Layers3, MapPinned, Mountain, Navigation, Search, ShieldCheck, Waves, CloudRain, Route, School, Bridge, CircleHelp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API = import.meta.env.VITE_API_URL || "";

const fmt=(v,d=1)=> v===null || v===undefined || Number.isNaN(Number(v)) ? "—" : Number(v).toLocaleString(undefined,{maximumFractionDigits:d});
const pct=(v)=> v===null || v===undefined ? "—" : `${Math.round(Number(v)*100)}%`;
const riskClass=(r)=>String(r||"LOW").toLowerCase();
const riskColor=(r)=> r==="HIGH"?"#e34d59":r==="MEDIUM"?"#e7a93b":"#2fae88";

function Stat({icon:Icon,label,value,sub}){
  return <div className="stat"><div className="statIcon"><Icon size={18}/></div><div><div className="muted tiny">{label}</div><div className="statValue">{value}</div>{sub&&<div className="muted tiny">{sub}</div>}</div></div>
}
function Pill({risk}){return <span className={`pill ${riskClass(risk)}`}><span className="dot"/>{risk||"LOW"}</span>}
function Card({children,className=""}){return <section className={`card ${className}`}>{children}</section>}

export default function App(){
  const [tab,setTab]=useState("overview");
  const [latest,setLatest]=useState([]);
  const [geo,setGeo]=useState(null);
  const [selected,setSelected]=useState("Swat");
  const [query,setQuery]=useState("");

  useEffect(()=>{Promise.all([
    fetch("/data/latest.json").then(r=>r.json()),
    fetch("/data/districts.geojson").then(r=>r.json())
  ]).then(([l,g])=>{setLatest(l);setGeo(g); if(l.length&&!l.find(x=>x.district==="Swat"))setSelected(l[0].district)})},[]);

  const current=useMemo(()=>latest.find(d=>d.district===selected)||latest[0],[latest,selected]);
  const sorted=useMemo(()=>[...latest].sort((a,b)=>(b.relief_priority_score||0)-(a.relief_priority_score||0)),[latest]);
  const filtered=useMemo(()=>latest.filter(d=>d.district.toLowerCase().includes(query.toLowerCase())).slice(0,8),[latest,query]);

  const mapStyle=feature=>{
    const name=feature.properties?.district||feature.properties?.ADM2_EN;
    const d=latest.find(x=>x.district===name);
    const r=d?.risk_level||"LOW";
    return {fillColor:riskColor(r),color:"#e9f1f4",weight:1,fillOpacity:name===selected?.8:.56};
  };
  const onEach=(feature,layer)=>{
    const name=feature.properties?.district||feature.properties?.ADM2_EN;
    layer.on({click:()=>setSelected(name)});
    layer.bindTooltip(name,{sticky:true,className:"mapTooltip"});
  };

  if(!current) return <div className="loading">Loading FloodShield…</div>;

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark"><Waves size={22}/></div><div><div className="brandName">FloodShield</div><div className="brandSub">Pakistan flood intelligence</div></div></div>
      <nav>
        {[["overview",MapPinned,"Overview"],["district",Gauge,"District Risk"],["relief",HeartPulse,"Relief Priority"],["method",Database,"Methodology & Data"]].map(([id,Icon,label])=>
          <button key={id} className={tab===id?"navItem active":"navItem"} onClick={()=>setTab(id)}><Icon size={18}/><span>{label}</span></button>
        )}
      </nav>
      <div className="sideNote"><ShieldCheck size={18}/><div><strong>Research prototype</strong><span>Model-based decision support — not an official NDMA/PDMA warning.</span></div></div>
    </aside>

    <main>
      <header className="topbar">
        <div><h1>{tab==="overview"?"National Overview":tab==="district"?"District Risk Intelligence":tab==="relief"?"Relief Priority":"Methodology & Data"}</h1>
        <p>29 high-exposure districts · 2010–2025 historical training window</p></div>
        <div className="searchWrap">
          <Search size={17}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search district…" />
          {query&&<div className="searchDrop">{filtered.map(d=><button key={d.district} onClick={()=>{setSelected(d.district);setQuery("");setTab("district")}}>{d.district}<span>{d.province}</span></button>)}</div>}
        </div>
      </header>

      {tab==="overview" && <Overview latest={latest} geo={geo} selected={selected} setSelected={setSelected} mapStyle={mapStyle} onEach={onEach} current={current} setTab={setTab}/>}
      {tab==="district" && <District current={current} setSelected={setSelected} latest={latest}/>}
      {tab==="relief" && <Relief sorted={sorted} setSelected={(d)=>{setSelected(d);setTab("district")}}/>}
      {tab==="method" && <Method/>}
    </main>
  </div>
}

function Overview({latest,geo,selected,setSelected,mapStyle,onEach,current,setTab}){
  const high=latest.filter(d=>d.risk_level==="HIGH").length;
  const medium=latest.filter(d=>d.risk_level==="MEDIUM").length;
  const maxRain=[...latest].sort((a,b)=>(b.monsoon_rainfall_mm||0)-(a.monsoon_rainfall_mm||0))[0];
  return <div className="content">
    <div className="hero">
      <div><span className="eyebrow">FLOODSHIELD · 2025 RETROSPECTIVE VIEW</span><h2>See where flood hazard and relief pressure intersect.</h2><p>Machine-learning hazard scores are combined with population and accessibility context to support faster district-level prioritization.</p></div>
      <div className="heroBadge"><Activity size={20}/><div><b>{latest.length}</b><span>districts monitored</span></div></div>
    </div>

    <div className="statGrid">
      <Stat icon={AlertTriangle} label="High-risk districts" value={high} sub="2025 model score"/>
      <Stat icon={Gauge} label="Medium-risk districts" value={medium} sub="2025 model score"/>
      <Stat icon={CloudRain} label="Highest monsoon rainfall" value={`${fmt(maxRain?.monsoon_rainfall_mm,0)} mm`} sub={maxRain?.district}/>
      <Stat icon={Database} label="Historical coverage" value="2010–2025" sub="district-year modelling"/>
    </div>

    <div className="gridMap">
      <Card className="mapCard">
        <div className="cardHead"><div><span className="eyebrow">INTERACTIVE MAP</span><h3>Flood hazard by district</h3></div><div className="legend"><span><i className="lg low"/>Low</span><span><i className="lg medium"/>Medium</span><span><i className="lg high"/>High</span></div></div>
        <div className="mapBox">{geo&&<MapContainer center={[30.5,69.5]} zoom={5} scrollWheelZoom={true} className="map">
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          <GeoJSON key={`${selected}-${latest.length}`} data={geo} style={mapStyle} onEachFeature={onEach}/>
        </MapContainer>}</div>
      </Card>

      <Card className="spotlight">
        <div className="cardHead"><div><span className="eyebrow">SELECTED DISTRICT</span><h3>{current.district}</h3><span className="muted">{current.province}</span></div><Pill risk={current.risk_level}/></div>
        <div className="riskRing" style={{"--p":`${Math.round((current.hazard_probability||0)*100)*3.6}deg`}}><div><b>{pct(current.hazard_probability)}</b><span>hazard score</span></div></div>
        <div className="miniGrid">
          <div><CloudRain size={17}/><b>{fmt(current.monsoon_rainfall_mm,0)} mm</b><span>monsoon rain</span></div>
          <div><Waves size={17}/><b>{fmt(current.river_density_km_per_km2,3)}</b><span>river density</span></div>
          <div><Mountain size={17}/><b>{fmt(current.mean_elevation_m,0)} m</b><span>mean elevation</span></div>
          <div><Building2 size={17}/><b>{fmt(current.population,0)}</b><span>population</span></div>
        </div>
        <button className="primary" onClick={()=>setTab("district")}>Open district intelligence <ChevronRight size={17}/></button>
      </Card>
    </div>
  </div>
}

function District({current,latest,setSelected}){
  const [scenario,setScenario]=useState({
    annual_rainfall_mm:current.annual_rainfall_mm||0, monsoon_rainfall_mm:current.monsoon_rainfall_mm||0,
    max_daily_rainfall_mm:current.max_daily_rainfall_mm||0, rainy_days:current.rainy_days||0,
    extreme_rain_days_50mm:current.extreme_rain_days_50mm||0
  });
  const [prediction,setPrediction]=useState(null);
  useEffect(()=>{setScenario({
    annual_rainfall_mm:current.annual_rainfall_mm||0, monsoon_rainfall_mm:current.monsoon_rainfall_mm||0,
    max_daily_rainfall_mm:current.max_daily_rainfall_mm||0, rainy_days:current.rainy_days||0,
    extreme_rain_days_50mm:current.extreme_rain_days_50mm||0
  });setPrediction(null)},[current.district]);

  async function runScenario(){
    if(!API){setPrediction({offline:true});return}
    const payload={...scenario,
      mean_elevation_m:current.mean_elevation_m||0,min_elevation_m:current.mean_elevation_m||0,max_elevation_m:current.mean_elevation_m||0,
      mean_slope_deg:current.mean_slope_deg||0,max_slope_deg:current.mean_slope_deg||0,
      river_length_km:current.river_length_km||0,river_density_km_per_km2:current.river_density_km_per_km2||0,
      river_reach_count:current.river_reach_count||0,mean_longterm_discharge_cms:current.mean_longterm_discharge_cms||0,
      max_longterm_discharge_cms:current.mean_longterm_discharge_cms||0,max_strahler_order:current.max_strahler_order||0,
      drainage_density_km_per_km2:current.drainage_density_km_per_km2||0,avg_dist_drainage_km:current.avg_dist_drainage_km||0
    };
    try{const r=await fetch(`${API}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});setPrediction(await r.json())}
    catch{setPrediction({offline:true})}
  }

  const driverData=[
    {name:"Monsoon rain",value:Math.min(100,(current.monsoon_rainfall_mm||0)/12)},
    {name:"River density",value:Math.min(100,(current.river_density_km_per_km2||0)*280)},
    {name:"Drainage density",value:Math.min(100,(current.drainage_density_km_per_km2||0)*180)},
    {name:"Extreme rain days",value:Math.min(100,(current.extreme_rain_days_50mm||0)*12)}
  ];
  return <div className="content">
    <div className={`alertBanner ${riskClass(current.risk_level)}`}>
      <div className="alertIcon"><AlertTriangle/></div>
      <div><span>FLOODSHIELD RISK ALERT · 2025 RETROSPECTIVE</span><h2>{current.district}: {current.risk_level} hazard · {pct(current.hazard_probability)}</h2><p>This score is a research-model output, not an official emergency warning.</p></div>
    </div>
    <div className="districtSelect"><label>District</label><select value={current.district} onChange={e=>setSelected(e.target.value)}>{latest.map(d=><option key={d.district}>{d.district}</option>)}</select><Pill risk={current.risk_level}/></div>

    <div className="twoCol">
      <Card>
        <div className="cardHead"><div><span className="eyebrow">HAZARD SNAPSHOT</span><h3>What the model sees</h3></div><Gauge/></div>
        <div className="metricRows">
          <Metric icon={CloudRain} label="Annual rainfall" value={`${fmt(current.annual_rainfall_mm,0)} mm`}/>
          <Metric icon={Droplets} label="Monsoon rainfall" value={`${fmt(current.monsoon_rainfall_mm,0)} mm`}/>
          <Metric icon={Mountain} label="Elevation / slope" value={`${fmt(current.mean_elevation_m,0)} m · ${fmt(current.mean_slope_deg,1)}°`}/>
          <Metric icon={Waves} label="River density" value={`${fmt(current.river_density_km_per_km2,3)} km/km²`}/>
          <Metric icon={Navigation} label="Drainage density" value={`${fmt(current.drainage_density_km_per_km2,3)} km/km²`}/>
        </div>
      </Card>
      <Card>
        <div className="cardHead"><div><span className="eyebrow">WHY THIS RISK?</span><h3>Key hazard signals</h3></div><BarChart3/></div>
        <div className="chartBox"><ResponsiveContainer width="100%" height="100%"><BarChart data={driverData} layout="vertical" margin={{left:10,right:10}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" domain={[0,100]} hide/><YAxis dataKey="name" type="category" width={110} tick={{fontSize:12}}/><Tooltip formatter={(v)=>`${Math.round(v)} relative signal`}/><Bar dataKey="value" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></div>
        <p className="note"><Info size={15}/>These are normalized dashboard signals. Formal model importance is global and available in Methodology.</p>
      </Card>
    </div>

    <Card>
      <div className="cardHead"><div><span className="eyebrow">EXPOSURE & RESPONSE</span><h3>Infrastructure context</h3></div><Layers3/></div>
      <div className="infraGrid">
        <Stat icon={Route} label="Road density" value={`${fmt(current.road_density_km_per_km2,2)} km/km²`}/>
        <Stat icon={Bridge} label="Bridges mapped" value={fmt(current.total_bridges,0)}/>
        <Stat icon={HeartPulse} label="Hospitals mapped" value={fmt(current.total_hospitals,0)}/>
        <Stat icon={School} label="Schools mapped" value={fmt(current.total_schools,0)}/>
      </div>
      <div className="note warn"><CircleHelp size={16}/>OpenStreetMap-derived counts reflect mapped/tagged features; zero may mean incomplete mapping, not true absence.</div>
    </Card>

    <Card>
      <div className="cardHead"><div><span className="eyebrow">SCENARIO LAB</span><h3>Change rainfall, test hazard</h3></div><CloudRain/></div>
      {Object.entries(scenario).map(([k,v])=><label className="slider" key={k}><span>{k.replaceAll("_"," ")}</span><b>{fmt(v,0)}</b><input type="range" min="0" max={k.includes("days")?120:1600} value={v} onChange={e=>setScenario({...scenario,[k]:Number(e.target.value)})}/></label>)}
      <button className="primary" onClick={runScenario}>Run model scenario</button>
      {prediction&&<div className="scenarioResult">{prediction.offline?<><b>Backend not connected yet.</b><span>Deploy the included FastAPI service and set VITE_API_URL in Vercel.</span></>:<><Pill risk={prediction.risk_level}/><b>{pct(prediction.flood_probability)}</b><span>{prediction.alert?"Risk-alert threshold crossed":"Below prototype alert threshold"}</span></>}</div>}
    </Card>
  </div>
}

function Metric({icon:Icon,label,value}){return <div className="metric"><div><Icon size={18}/><span>{label}</span></div><b>{value}</b></div>}

function Relief({sorted,setSelected}){
  const top=sorted.slice(0,10).map(d=>({name:d.district,score:Math.round(d.relief_priority_score||0)}));
  return <div className="content">
    <div className="hero compact"><div><span className="eyebrow">DECISION-SUPPORT LAYER</span><h2>Prioritize where hazard and exposure overlap.</h2><p>Relief priority is separate from flood hazard. It combines the model hazard score with population and road-access context.</p></div></div>
    <div className="twoCol">
      <Card><div className="cardHead"><div><span className="eyebrow">TOP 10</span><h3>Relief priority ranking</h3></div><HeartPulse/></div><div className="chartBox tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={top} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" domain={[0,100]}/><YAxis dataKey="name" type="category" width={105} tick={{fontSize:12}}/><Tooltip/><Bar dataKey="score" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></div></Card>
      <Card><div className="cardHead"><div><span className="eyebrow">RANKING TABLE</span><h3>29 districts</h3></div><Layers3/></div><div className="rankList">{sorted.map((d,i)=><button key={d.district} onClick={()=>setSelected(d.district)}><span className="rankNo">{String(i+1).padStart(2,"0")}</span><span className="rankName"><b>{d.district}</b><small>{d.province}</small></span><Pill risk={d.risk_level}/><strong>{fmt(d.relief_priority_score,0)}</strong></button>)}</div></Card>
    </div>
  </div>
}

function Method(){
  const sources=[
    ["Rainfall","CHIRPS — Climate Hazards Center, UC Santa Barbara","District-level rainfall features for 2010–2025."],
    ["Elevation & slope","SRTM 30 m via OpenTopoData","Terrain statistics extracted inside district boundaries."],
    ["Rivers","HydroRIVERS / HydroSHEDS","River length, density, reach count, Strahler order and long-term discharge estimates."],
    ["Infrastructure","OpenStreetMap-derived district summaries","Roads, drainage, bridges, buildings, hospitals and schools."],
    ["Flood labels & impacts","Compiled NDMA / OCHA / World Bank-GFDRR / cited historical sources","Historical event labels, severity and impact context; post-event fields excluded from hazard training."],
    ["Boundaries","Pakistan ADM2 district boundary clips","29 selected district geometries used for extraction and web mapping."]
  ];
  return <div className="content">
    <div className="hero compact"><div><span className="eyebrow">TRANSPARENT BY DESIGN</span><h2>What the model uses — and what it deliberately does not.</h2><p>FloodShield separates physical hazard prediction from exposure and relief prioritization to reduce leakage and make decisions easier to explain.</p></div></div>
    <div className="methodGrid">
      <Card><span className="eyebrow">MODEL</span><h3>XGBoost classifier</h3><p>Selected after comparison with Logistic Regression and Random Forest under district-grouped cross-validation.</p><div className="bigMetric">0.786<span>mean ROC-AUC</span></div><div className="bigMetric">0.376<span>mean PR-AUC</span></div></Card>
      <Card><span className="eyebrow">VALIDATION</span><h3>District-grouped 5-fold CV</h3><p>All years from the same district stay together in a fold, reducing leakage from repeated static district features.</p><div className="methodLine"><b>Primary labels</b><span>confirmed positive + confirmed negative only</span></div><div className="methodLine"><b>Alert threshold</b><span>0.30 prototype threshold</span></div></Card>
      <Card><span className="eyebrow">LIMITATIONS</span><h3>Research prototype</h3><p>Historical labels are sparse and selected districts are not a random national sample. Probabilities are model scores, not calibrated official forecasts.</p><div className="note warn"><AlertTriangle size={16}/>Do not use FloodShield as a substitute for NDMA/PDMA warnings.</div></Card>
    </div>
    <Card>
      <div className="cardHead"><div><span className="eyebrow">DATA PROVENANCE</span><h3>Sources used in the project</h3></div><Database/></div>
      <div className="sources">{sources.map(([a,b,c])=><div className="source" key={a}><div className="sourceIcon"><Database size={18}/></div><div><b>{a}</b><span>{b}</span><p>{c}</p></div></div>)}</div>
    </Card>
  </div>
}
