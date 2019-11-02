<template>
  <div id="app">
    <div class="files">
      <p v-if="!isLoading">Pictures:</p>
      <p v-else>Uploading...</p>
      <button v-if="files.length > 0" type="button" @click="clearFiles">
        Clear
      </button>
      <ul>
        <li v-for="f in files" :key="`file-${f}`">{{ f }}</li>
      </ul>
      <form v-if="!isLoading" @submit.prevent="uploadFile">
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/x-png,image/jpeg"
          @change="handleFileInput"
        />
        <button v-if="showUpload" type="submit">
          Upload
        </button>
      </form>
    </div>
    <div class="code-editor">
      <form @submit.prevent="updateCss">
        <prism-editor v-model="code" language="css"></prism-editor>
        <button type="submit">Save</button>
      </form>
    </div>
    <div class="iframe-viewer">
      <iframe
        ref="iframe"
        src="http://localhost:3000/"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>

<script>
import Axios from "axios";

const server = "http://localhost:3000";
const axios = Axios.create();
axios.defaults.timeout = 5000;

export default {
  name: "app",
  data() {
    return {
      code: "",
      files: [],
      isLoading: false,
      showUpload: false,
    };
  },
  async created() {
    await this.getCss();
    await this.getFiles();
  },
  methods: {
    async getCss() {
      const res = await axios({
        method: "get",
        url: server + "/css",
        responseType: "text",
      });
      if (res.status !== 200) {
        console.error(res.data);
      }
      this.code = res.data;
    },
    async updateCss() {
      this.$refs.iframe.src = "";
      await axios({
        method: "post",
        url: server + "/css",
        headers: { "Content-Type": "text/plain" },
        data: this.code,
        responseType: "text",
      });
      this.$refs.iframe.src = server;
    },
    handleFileInput(e) {
      if (e.target.files) {
        // `my` prefix means local variable - this comment will be removed
        this.myFiles = e.target.files;
        this.showUpload = true;
      } else {
        this.showUpload = false;
      }
    },
    async uploadFile() {
      this.isLoading = true;
      console.log("files are", this.files);
      let formData = new FormData();
      this.myFiles.forEach(file => {
        formData.append(file.name, file);
      });
      const res = await axios({
        method: "post",
        url: server + "/upload",
        headers: { "Content-Type": "multipart/form-data" },
        data: formData,
      });
      this.isLoading = false;

      if (res.status !== 200) {
        console.error(res.data);
      } else {
        this.showUpload = false;
        await this.getFiles();
      }
    },
    async getFiles() {
      this.isLoading = true;
      const res = await axios({
        method: "get",
        url: server + "/upload",
        responseType: "json",
      });
      if (res.status !== 200) {
        console.error(res.data);
        return;
      }
      if (!res.data.files) {
        console.error("Expect `res.data.files`. Check server.");
        return;
      }
      this.files = res.data.files;
      this.isLoading = false;
    },
    async clearFiles() {
      this.isLoading = true;
      const res = await axios({
        method: "post",
        url: server + "/clear",
      });
      if (res.status !== 200) {
        console.error(res.data);
      }
      this.isLoading = false;
      await this.getFiles();
    },
  },
};
</script>

<style lang="scss">
#app {
  display: grid;
  grid-template:
    "files files"
    "code viewer" / 1fr 1fr;
}
.files {
  grid-area: files;
}
.code-editor {
  grid-area: code;
  min-height: 50vh;
}
.iframe-viewer {
  grid-area: viewer;
}
.iframe-viewer,
.iframe-viewer > iframe {
  width: 100%;
  height: 100%;
}
</style>
