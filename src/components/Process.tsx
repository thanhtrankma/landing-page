import { processSteps } from "@/data/content";

export default function Process() {
  return (
    <section id="process" className="bg-muted py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600">Quy trình</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Rõ ràng ở từng điểm chạm</h2>
          <p className="mt-3 text-muted-foreground">
            Quy trình linh hoạt giúp dự án đi nhanh nhưng không đánh đổi chất lượng.
          </p>
        </div>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step) => (
            <li key={step.number} className="rounded-2xl border border-border bg-background p-6">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white">
                {step.number.replace("0", "")}
              </span>
              <h3 className="font-bold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
