const SwitchThemeButton = document.getElementById("SwitchThemeButton");
const LanguageSelect = document.getElementById("LanguageSelect");
const LatexInput = document.getElementById("LatexInput");
const SubmitButton = document.getElementById("SubmitButton");
const SimpleResult = document.getElementById("SimpleResult");
const FullResult = document.getElementById("FullResult");

const UTF8ToBase64 = (UTF8String) => {
    return btoa(unescape(encodeURIComponent(UTF8String)));
}
const SetTheme = (Theme) => {
    if (Theme === "dark") {
        document.body.dataset.bsTheme = "dark";
        SwitchThemeButton.children[0].className = "bi bi-moon-stars-fill";
    }
    else if (Theme === "light") {
        document.body.dataset.bsTheme = "light";
        SwitchThemeButton.children[0].className = "bi bi-brightness-high-fill";
    }
    localStorage.setItem("Theme", Theme);
};
const SetLanguage = (Language) => {
    LanguageSelect.value = Language;
    localStorage.setItem("Language", Language);
}
const AddLoadingSpinner = (Element) => {
    const LoadingSpinner = document.createElement("div");
    LoadingSpinner.className = "spinner-border spinner-border-sm";
    LoadingSpinner.setAttribute("role", "status");
    LoadingSpinner.setAttribute("aria-hidden", "true");
    Element.appendChild(LoadingSpinner);
}
const RemoveLoadingSpinner = (Element) => {
    if (Element.lastChild.className === "spinner-border spinner-border-sm") {
        Element.removeChild(Element.lastChild);
    }
}
const RequestAPI = async (Endpoint, Data) => {
    const Result = await fetch("/" + Endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Data),
    });
    const JSONResult = await Result.json();
    if (!JSONResult.Success) {
        console.log(JSONResult.Error);
        alert(JSONResult.Error);
    }
    return JSONResult.Data;
};
const SolveSimpleLatex = (LatexExpression, Language) => {
    AddLoadingSpinner(SimpleResult);
    RequestAPI("SolveSimpleLatex", { LatexExpression, Language })
        .then(Result => {
            RemoveLoadingSpinner(SimpleResult);
            SimpleResult.innerHTML = "$$" + Result + "$$";
            MathJax.typesetPromise();
        });
};
const SolveLatex = (LatexExpression, Language) => {
    AddLoadingSpinner(FullResult);
    RequestAPI("SolveLatex", { LatexExpression, Language })
        .then(Result => {
            RemoveLoadingSpinner(FullResult);
            FullResult.innerHTML = "";
            Result.forEach(Item => {
                const AccordionItem = document.createElement("div");
                AccordionItem.className = "accordion-item";
                const AccordionHeader = document.createElement("h2");
                AccordionHeader.className = "accordion-header";
                const AccordionButton = document.createElement("button");
                AccordionButton.className = "accordion-button";
                AccordionButton.type = "button";
                AccordionButton.setAttribute("data-bs-toggle", "collapse");
                AccordionButton.setAttribute("data-bs-target", `#collapse${UTF8ToBase64(Item.Name)}`);
                AccordionButton.innerHTML = Item.Name;
                const AccordionCollapse = document.createElement("div");
                AccordionCollapse.id = `collapse${UTF8ToBase64(Item.Name)}`;
                AccordionCollapse.className = "accordion-collapse collapse show";
                const AccordionBody = document.createElement("div");
                AccordionBody.className = "accordion-body";
                const AccordionBodyText = document.createElement("p");
                AccordionBodyText.classList.add("mb-2");
                AccordionBodyText.innerHTML = Item.Answer;
                AccordionBody.appendChild(AccordionBodyText);
                const TemplateAccordion = document.createElement("div");
                TemplateAccordion.className = "accordion";
                Item.TemplateSteps.forEach(TemplateSteps => {
                    const TemplateAccordionItem = document.createElement("div");
                    TemplateAccordionItem.className = "accordion-item";
                    const TemplateStepsHeader = document.createElement("div");
                    TemplateStepsHeader.className = "accordion-header";
                    const TemplateStepsButton = document.createElement("button");
                    TemplateStepsButton.className = "accordion-button collapsed";
                    TemplateStepsButton.type = "button";
                    TemplateStepsButton.setAttribute("data-bs-toggle", "collapse");
                    TemplateStepsButton.setAttribute("data-bs-target", `#collapse${UTF8ToBase64(TemplateSteps.Name)}`);
                    TemplateStepsButton.innerHTML = TemplateSteps.Name;
                    TemplateStepsHeader.appendChild(TemplateStepsButton);
                    const TemplateStepsCollapse = document.createElement("div");
                    TemplateStepsCollapse.id = `collapse${UTF8ToBase64(TemplateSteps.Name)}`;
                    TemplateStepsCollapse.className = "accordion-collapse collapse";
                    const TemplateStepsBody = document.createElement("div");
                    TemplateStepsBody.className = "accordion-body";
                    TemplateSteps.Steps.forEach(Step => {
                        const Card = document.createElement("div");
                        Card.className = "card mb-2";
                        const CardBody = document.createElement("div");
                        CardBody.className = "card-body";
                        const CardTitle = document.createElement("h5");
                        CardTitle.className = "card-title";
                        CardTitle.innerHTML = Step.Hint;
                        const CardText = document.createElement("p");
                        CardText.className = "card-text";
                        CardText.innerHTML = Step.Step;
                        const CardFooter = document.createElement("div");
                        CardFooter.className = "card-footer";
                        const CardFooterText = document.createElement("small");
                        CardFooterText.className = "text-muted";
                        CardFooterText.innerHTML = Step.Expression;
                        CardBody.appendChild(CardTitle);
                        CardBody.appendChild(CardText);
                        CardFooter.appendChild(CardFooterText);
                        Card.appendChild(CardBody);
                        Card.appendChild(CardFooter);
                        TemplateStepsBody.appendChild(Card);
                    });
                    TemplateStepsCollapse.appendChild(TemplateStepsBody);
                    TemplateAccordionItem.appendChild(TemplateStepsHeader);
                    TemplateAccordionItem.appendChild(TemplateStepsCollapse);
                    TemplateAccordion.appendChild(TemplateAccordionItem);
                });
                AccordionBody.appendChild(TemplateAccordion);
                AccordionCollapse.appendChild(AccordionBody);
                AccordionHeader.appendChild(AccordionButton);
                AccordionItem.appendChild(AccordionHeader);
                AccordionItem.appendChild(AccordionCollapse);
                FullResult.appendChild(AccordionItem);
            });
            MathJax.typesetPromise();
        });
};

MathJax = {
    loader: {
        load: [
            "input/tex-base",
            "output/chtml",
        ],
    },
    tex: {
        inlineMath: [
            ["$", "$"],
        ],
        displayMath: [
            ["$$", "$$"],
        ],
        processEscapes: true,
        processEnvironments: true,
        packages: { "[+]": ["noerrors"] },
    },
};

SwitchThemeButton.addEventListener("click", () => {
    if (document.body.dataset.bsTheme === "dark") {
        SetTheme("light");
    }
    else if (document.body.dataset.bsTheme === "light") {
        SetTheme("dark");
    }
});
LanguageSelect.addEventListener("change", () => {
    SetLanguage(LanguageSelect.value);
});
LatexInput.addEventListener("input", () => {
    SimpleResult.innerHTML = "";
    FullResult.innerHTML = "";
    if (LatexInput.value != "") {
        SolveSimpleLatex(LatexInput.value, LanguageSelect.value);
    }
});
SubmitButton.addEventListener("click", () => {
    SimpleResult.innerHTML = "";
    FullResult.innerHTML = "";
    SubmitButton.disabled = true;
    AddLoadingSpinner(SubmitButton);
    SolveSimpleLatex(LatexInput.value, LanguageSelect.value);
    SolveLatex(LatexInput.value, LanguageSelect.value);
    SubmitButton.disabled = false;
    RemoveLoadingSpinner(SubmitButton);
});

SetTheme(localStorage.getItem("Theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light");
SetLanguage(localStorage.getItem("Language") || navigator.language.split("-")[0] || "en");
