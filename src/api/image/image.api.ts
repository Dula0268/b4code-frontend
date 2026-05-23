import api from "@/lib/axios";

export const imageApi = {
  upload: (file: File, folder: string = "profiles") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    return api
      .post("/images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((r) => r.data);
  },
};
