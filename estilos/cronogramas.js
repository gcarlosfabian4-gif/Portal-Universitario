document.addEventListener("DOMContentLoaded", () => {
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const messages = document.getElementById("uploadMessages");
  const btnUpload = document.getElementById("btnUpload");
  const btnClear = document.getElementById("btnClear");

  if (!uploadZone || !fileInput || !fileList || !messages || !btnUpload || !btnClear) {
    console.error("No se encontraron todos los elementos de la sección de subida.");
    return;
  }

  const MAX_FILES = 3;
  const MAX_SIZE = 15 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".zip", ".pptx"];
  let selectedFiles = [];

  // Evita que el navegador abra el archivo al soltarlo fuera de la zona.
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    document.addEventListener(eventName, event => {
      event.preventDefault();
    });
  });

  ["dragenter", "dragover"].forEach(eventName => {
    uploadZone.addEventListener(eventName, event => {
      event.preventDefault();
      uploadZone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => {
      uploadZone.classList.remove("dragover");
    });
  });

  uploadZone.addEventListener("drop", event => {
    handleFiles(Array.from(event.dataTransfer.files));
  });

  fileInput.addEventListener("change", () => {
    handleFiles(Array.from(fileInput.files));
    fileInput.value = "";
  });

  function handleFiles(files) {
    clearMessages();

    for (const file of files) {
      if (selectedFiles.length >= MAX_FILES) {
        showMessage(`Solo se permiten ${MAX_FILES} archivos como máximo.`, "error");
        break;
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        showMessage(validation.message, "error");
        continue;
      }

      const duplicate = selectedFiles.some(existing =>
        existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified
      );

      if (duplicate) {
        showMessage(`"${file.name}" ya está en la lista.`, "info");
        continue;
      }

      selectedFiles.push(file);
    }

    renderFileList();
    updateButtons();
  }

  function validateFile(file) {
    const dot = file.name.lastIndexOf(".");
    const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return { valid: false, message: `"${file.name}" no está permitido. Usa PDF, DOCX, ZIP o PPTX.` };
    }
    if (file.size > MAX_SIZE) {
      return { valid: false, message: `"${file.name}" supera el límite de 15 MB.` };
    }
    if (file.size === 0) {
      return { valid: false, message: `"${file.name}" está vacío.` };
    }
    return { valid: true };
  }

  function renderFileList() {
    fileList.replaceChildren();

    selectedFiles.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "file-item";

      const info = document.createElement("div");
      info.className = "file-info";

      const icon = document.createElement("span");
      icon.className = "file-icon";
      icon.textContent = getFileIcon(file.name);

      const details = document.createElement("div");
      details.className = "file-details";

      const name = document.createElement("div");
      name.className = "file-name";
      name.textContent = file.name;

      const size = document.createElement("div");
      size.className = "file-size";
      size.textContent = formatSize(file.size);

      details.append(name, size);
      info.append(icon, details);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "file-remove";
      remove.textContent = "Eliminar";
      remove.setAttribute("aria-label", `Eliminar ${file.name}`);
      remove.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        renderFileList();
        updateButtons();
        clearMessages();
      });

      item.append(info, remove);
      fileList.append(item);
    });
  }

  function getFileIcon(filename) {
    const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
    const icons = { ".pdf": "📄", ".docx": "📝", ".zip": "🗜️", ".pptx": "📊" };
    return icons[extension] || "📎";
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function showMessage(message, type) {
    const element = document.createElement("div");
    element.className = `msg msg-${type}`;
    element.textContent = message;
    messages.append(element);
  }

  function clearMessages() {
    messages.replaceChildren();
  }

  function updateButtons() {
    btnUpload.disabled = selectedFiles.length === 0;
    btnClear.hidden = selectedFiles.length === 0;
  }

  btnClear.addEventListener("click", () => {
    selectedFiles = [];
    renderFileList();
    updateButtons();
    clearMessages();
  });

  btnUpload.addEventListener("click", () => {
    if (selectedFiles.length === 0) return;

    // Demostración: no envía archivos a un servidor.
    btnUpload.disabled = true;
    btnClear.disabled = true;
    btnUpload.textContent = "Procesando...";

    window.setTimeout(() => {
      const count = selectedFiles.length;
      selectedFiles = [];
      renderFileList();
      updateButtons();
      clearMessages();
      showMessage(`Validación completada: ${count} archivo${count === 1 ? "" : "s"} listo${count === 1 ? "" : "s"} para enviar. Esta versión todavía no los guarda en un servidor.`, "success");
      btnUpload.textContent = "Enviar entrega";
      btnClear.disabled = false;
    }, 700);
  });
});
