import axios from "axios";

export const filepreview = (fileName: number) => {
  return axios.get("http://192.168.1.141:9020/file/preview", {
    params: {
      fileName
    }
  });
};
