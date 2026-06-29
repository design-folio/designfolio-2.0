export default function SectionTitle({ title, subtitle, testIds }) {
  return (
    <>
      <h1 className="text-foreground mb-2 text-2xl font-semibold" data-testid={testIds?.title}>
        {title}
      </h1>
      <p className="text-foreground/60 mb-4 text-sm md:mb-8" data-testid={testIds?.desc}>
        {subtitle}
      </p>
    </>
  );
}
