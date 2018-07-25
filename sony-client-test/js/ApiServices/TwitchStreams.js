import ApiService from "../ApiService.js";
import Util from "../Util.js";

export default class TwitchStreams extends ApiService {
  constructor() {
    super({
      baseUrl: "https://api.twitch.tv/kraken/search/streams",
      defaultFetchOptions: {
        headers: {
            "Client-ID":    "9rlrycpp69om1kg80jjugioq07lr9t",
        }
      }
    });
  }

  search(query, offset, options) {
    let url = this.props.baseUrl + "?query=" + encodeURIComponent(query)
            + "&offset=" + offset;
    let fetchOptions = Util.extendObject(
      this.props.defaultFetchOptions,
      options || {},
      true
    );

    fetch(url, fetchOptions)
    .then(function(response) {
      if(response.ok) {
        return response.json();
      }
      throw new Error('Something went wrong.');
    })
    .then((json) => options.handlers.success(json))
    .catch((error) => options.handlers.error(error));
  }
}
