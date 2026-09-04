(() => {
  "use strict";

  const agree = document.querySelector("#project-guide-agree");
  const continueButton = document.querySelector("#project-guide-continue");
  const chatTab = document.querySelector('.tab[data-tab="chat"]');
  const projectTab = document.querySelector('.tab[data-tab="project"]');

  if (!agree || !continueButton || !chatTab || !projectTab) return;

  let accepted = false;

  agree.addEventListener("change", () => {
    continueButton.disabled = !agree.checked;
  });

  chatTab.addEventListener(
    "click",
    (event) => {
      if (accepted) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      projectTab.click();
    },
    true,
  );

  continueButton.addEventListener("click", () => {
    if (!agree.checked) return;

    accepted = true;
    chatTab.click();
  });
})();
