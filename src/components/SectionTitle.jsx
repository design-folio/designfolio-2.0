
export default function SectionTitle({ title, subtitle, testIds }) {
    return (
        <>
            <h1 className="text-2xl font-semibold mb-2 text-foreground" data-testid={testIds?.title}>
                {title}
            </h1>
            <p className="text-sm text-foreground/60 mb-4 md:mb-8" data-testid={testIds?.desc}>
                {subtitle}
            </p>
        </>
    );
}