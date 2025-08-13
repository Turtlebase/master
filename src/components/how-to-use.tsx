"use client";

interface Step {
    title: string;
    description: string;
}

interface HowToUseProps {
    steps: Step[];
}

export function HowToUse({ steps }: HowToUseProps) {
    return (
        <div className="how-to-use">
            <ol>
                {steps.map((step, index) => (
                    <li key={index}>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                    </li>
                ))}
            </ol>
        </div>
    )
}
