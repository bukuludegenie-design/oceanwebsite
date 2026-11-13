
/* =========================================
   OCEAN MEDIA GROUP
   Main Website JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // MOBILE NAVIGATION
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-header nav");

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      navigation.classList.toggle("open");

      const isOpen = navigation.classList.contains("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navigation.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // CURRENT YEAR
  const yearElement = document.querySelector("#current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // WHATSAPP CONTACT
  const whatsappNumber = "211921329132";

  const whatsappMessage = encodeURIComponent(
    "Hello OCEAN Media Group. I would like to make an enquiry."
  );

  const whatsappURL =
    `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  document.querySelectorAll(
    ".floating-whatsapp, .whatsapp-cta"
  ).forEach(button => {
    button.setAttribute("href", whatsappURL);
    button.setAttribute("target", "_blank");
    button.setAttribute("rel", "noopener noreferrer");
  });

  // WEBSITE DASHBOARD
  const dashboardButton =
    document.querySelector("#open-dashboard");

  const dashboardDialog =
    document.querySelector("#admin-dialog");

  const closeDashboard =
    document.querySelector(".close-dialog");

  if (dashboardButton && dashboardDialog) {
    dashboardButton.addEventListener("click", () => {
      dashboardDialog.showModal();
    });
  }

  if (closeDashboard && dashboardDialog) {
    closeDashboard.addEventListener("click", () => {
      dashboardDialog.close();
    });
  }

  // WEBSITE UPDATES STORAGE
  const STORAGE_KEY = "oceanWebsiteUpdates";

  const updateForm = document.querySelector("#update-form");
  const updateList = document.querySelector("#admin-list");
  const updateTitle = document.querySelector("#update-title");
  const updateCategory = document.querySelector("#update-category");
  const updateDescription =
    document.querySelector("#update-description");

  let updates = [];

  try {
    updates = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(updates)) {
      updates = [];
    }
  } catch (error) {
    updates = [];
  }

  function saveUpdates() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updates)
    );
  }

  // DISPLAY UPDATES IN DASHBOARD
  function renderUpdates() {
    if (!updateList) return;

    updateList.innerHTML = "";

    if (updates.length === 0) {
      updateList.innerHTML =
        '<p class="admin-help">No updates have been added yet.</p>';
      return;
    }

    updates.forEach((update, index) => {
      const item = document.createElement("div");
      item.className = "admin-item";

      const details = document.createElement("div");

      const title = document.createElement("strong");
      title.textContent = update.title;

      const description = document.createElement("p");
      description.textContent =
        `${update.category} · ${update.date}`;

      details.append(title, description);

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", () => {
        if (confirm("Delete this update?")) {
          updates.splice(index, 1);
          saveUpdates();
          renderUpdates();
        }
      });

      item.append(details, deleteButton);
      updateList.appendChild(item);
    });
  }

  renderUpdates();

  // ADD NEW UPDATE
  if (updateForm) {
    updateForm.addEventListener("submit", event => {
      event.preventDefault();

      const title = updateTitle?.value.trim();
      const category = updateCategory?.value;
      const description = updateDescription?.value.trim();

      if (!title || !category || !description) {
        alert("Please complete all the fields.");
        return;
      }

      const newUpdate = {
        id: Date.now(),
        title,
        category,
        description,
        date: new Date().toLocaleDateString()
      };

      updates.unshift(newUpdate);

      saveUpdates();
      renderUpdates();

      updateForm.reset();

      alert(
        "Your update has been saved in this browser."
      );
    });
  }

  // EXPORT WEBSITE UPDATES
  const exportButton =
    document.querySelector("#export-updates");

  if (exportButton) {
    exportButton.addEventListener("click", () => {
      const file = new Blob(
        [JSON.stringify(updates, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(file);
      const link = document.createElement("a");

      link.href = url;
      link.download = "ocean-website-updates.json";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    });
  }

  // IMPORT WEBSITE UPDATES
  const importInput =
    document.querySelector("#import-updates");

  if (importInput) {
    importInput.addEventListener("change", event => {
      const file = event.target.files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result);

          if (
            !Array.isArray(imported) ||
            !imported.every(item =>
              item &&
              typeof item.title === "string" &&
              typeof item.description === "string" &&
              typeof item.category === "string"
            )
          ) {
            throw new Error("Invalid update file");
          }

          updates = imported;
          saveUpdates();
          renderUpdates();

          alert("Updates imported successfully.");
        } catch (error) {
          alert(
            "Unable to import. Please select a valid OCEAN updates file."
          );
        }

        importInput.value = "";
      };

      reader.readAsText(file);
    });
  }

  // CLEAR ALL UPDATES
  const clearButton =
    document.querySelector("#clear-updates");

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to delete all saved updates from this browser?"
        )
      ) {
        updates = [];
        saveUpdates();
        renderUpdates();
      }
    });
  }

  // SCROLL REVEAL ANIMATIONS
  const revealElements = document.querySelectorAll(
    ".section-heading, .city-video-card, .artist-news-card, .ceo-grid, .contact-grid"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach(element => {
      element.classList.add("reveal");
      observer.observe(element);
    });
  } else {
    revealElements.forEach(element => {
      element.classList.add("visible");
    });
  }

  // BACK TO TOP
  const backToTop =
    document.querySelector("#back-to-top");

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  // OCEAN BRAND MESSAGE
  console.log(
    "%c OCEAN MEDIA GROUP ",
    "background:#55d6cf;color:#041b29;font-size:18px;font-weight:bold;padding:10px;"
  );

  console.log(
    "Trade. Entertainment. Media Coverage."
  );
});
