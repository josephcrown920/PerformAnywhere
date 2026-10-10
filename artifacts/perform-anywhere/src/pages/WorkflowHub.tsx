import AppLayout from "@/components/AppLayout";

export default function WorkflowHub() {
  return (
    <AppLayout>
      <main className="mx-auto max-w-6xl px-6 py-12 text-white">
        <p className="text-sm text-white/40">PERFORM ANYWHERE</p>
        <h1 className="mt-2 text-4xl font-bold">Workflow Engine</h1>
        <p className="mt-3 max-w-2xl text-white/50">Production workflows, intelligent planning, Seedance capabilities, GPU racing and creative variants.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Motion Transfer", "Performance preservation, identity, outfit and scene replacement."],
            ["Music Video Suite", "Lip sync, beat sync, camera choreography and multi-shot continuity."],
            ["Product Ad Factory", "Studio, lifestyle, UGC, luxury and cinematic ad variants."],
            ["Identity Lock", "Keep identity, wardrobe, hair and character continuity."],
            ["Creative Variants", "Generate structured hooks, cameras, environments and compositions."],
            ["Shot Builder", "Scene → Subject → Camera → Motion → Lighting → Style → Duration."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-white/45">{description}</p>
            </div>
          ))}
        </div>
      </main>
    </AppLayout>
  );
}
