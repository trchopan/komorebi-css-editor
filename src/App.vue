<template>
  <div id="app">
    <div class="files">
      <div class="pictures">
        <label>Pictures:</label>
        <ul class="list-group">
          <li v-for="f in files" :key="`file-${f}`" class="list-group-item">
            {{ f }}
          </li>
        </ul>
        <div v-if="isLoading" class="progress">
          <div
            class="progress-bar progress-bar-striped active"
            role="progressbar"
            aria-valuenow="100"
            aria-valuemin="0"
            aria-valuemax="100"
            style="width: 100%"
          ></div>
        </div>
        <div class="pictures--foot row">
          <button
            type="button"
            @click="clearFiles"
            class="btn btn-default col-xs-3 col-md-2"
            :disabled="files.length <= 0"
          >
            Clear
          </button>
          <input
            ref="fileInput"
            class="form-control sr-only"
            type="file"
            multiple
            accept="image/x-png,image/jpeg"
            @change="handleFileInput"
          />
          <button
            @click="$refs.fileInput.click()"
            class="btn col-xs-3 col-xs-offset-6 col-md-2 col-md-offset-8"
          >
            Upload
          </button>
        </div>
      </div>
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
        this.uploadFile(e.target.files);
      }
    },
    async uploadFile(files) {
      this.isLoading = true;
      console.log("files are", files);
      let formData = new FormData();
      files.forEach(file => {
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
.pictures {
  .pictures--foot {
    display: flex;
  }
}
</style>
