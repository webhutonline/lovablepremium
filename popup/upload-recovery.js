(() => {
  "use strict";

  const nativeFetch = window.fetch.bind(window);
  const retryableStatuses = new Set([500, 502, 503, 504]);

  function isUploadRequest(resource, init = {}) {
    const url = String(
      typeof resource === "string" ? resource : resource?.url || "",
    );
    const body =
      init.body ?? (resource instanceof Request ? resource.body : null);
    const uploadUrl = /(?:upload|attachment|asset|storage|file)/i.test(url);
    const uploadBody = body instanceof FormData || body instanceof Blob;
    const serializedUploadBody =
      typeof body === "string" &&
      /(?:fileName|filename|mimeType|base64|attachment)/i.test(body);

    return uploadUrl || uploadBody || serializedUploadBody;
  }

  async function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  window.fetch = async function fetchWithUploadRecovery(resource, init) {
    if (!isUploadRequest(resource, init)) {
      return nativeFetch(resource, init);
    }

    const request = resource instanceof Request ? resource.clone() : resource;
    let response;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const currentResource =
        request instanceof Request ? request.clone() : request;
      try {
        response = await nativeFetch(currentResource, init);
      } catch (error) {
        if (attempt === 2) throw error;
        await wait(400 * 2 ** attempt);
        continue;
      }

      if (!retryableStatuses.has(response.status) || attempt === 2) {
        return response;
      }

      await wait(400 * 2 ** attempt);
    }

    return response;
  };
})();
