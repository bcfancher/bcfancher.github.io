import TwitchStreams from "./ApiServices/TwitchStreams.js";
import Util from "./Util.js";

class StreamSearch {

  constructor(props)
  {
    this.props = props;
    this.bindEvents();
    this.twitchSvc = new TwitchStreams();
  }

  bindEvents() {
    var me = this;
    var searchForm = document.getElementById("search-form");

    searchForm.addEventListener("submit",
      (e) => me.searchFormSubmitHandler(e),
      { capture: true, passive: false }
    );
    searchForm.addEventListener("focus",
      (e) => me.searchFormFocusHandler(e),
      { capture: true, passive: false }
    );
    searchForm.addEventListener("blur",
      (e) => me.searchFormBlurHandler(e),
      { capture: true, passive: false }
    );
  }

  searchFormSubmitHandler(e) {
     e.preventDefault();

     let formData = this.validateSearchForm();
     if (formData) {
       this.sendSearchRequest( formData.get('search') );
     } else {
       // TODO: add some validation feedback
       alert('errors found with submission');
     }
  }

  searchFormFocusHandler(e) {
     let target = e.target;
     if (target.tagName == 'INPUT' && target.name == 'search') {
       if (target.value == 'Search Query...' ) {
         target.value = '';
       }
     }
  }

  searchFormBlurHandler(e) {
     let target = e.target;
     if (target.tagName == 'INPUT' && target.name == 'search') {
       if (!target.value ) {
         target.value = 'Search Query...';
       }
     }
  }

  validateSearchForm() {
    let values = {};
    let formData = new FormData(document.getElementById('search-form'));

    for (var entry of formData.entries()) {
      switch(entry[0]) {
        case 'search':
          if ( !entry[1] || entry[1] == 'Search Query...') return false;
          break;
      }
		}
    return formData;
  }

  sendSearchRequest(query, offset=0) {
    this.props.query = query;
    this.props.currentOffset = offset;

    this.renderLoadingScreen();

    let me = this;
    this.twitchSvc.search(
      this.props.query,
      this.props.currentOffset,
      {
        handlers: {
          success: (response) => me.populateSearchResults(response),
          error: (e) => me.showErrorMessage(e)
        }
      }
    );
  }

  renderLoadingScreen() {
    let body = document.getElementById('body');
    let container = document.getElementById('container');
    if (container) {
      container.innerHTML = Util.loadTemplate('loadingResults.tpl');
    } else {
      body.innerHTML = Util.loadTemplate('loadingResults.tpl');
    }
  }

  populateSearchResults(responseJson) {
    console.log(responseJson);
    let body = document.getElementById('body');
    this.props.totalPages = Math.ceil(responseJson._total / 10);
    this.props.currentPage = (this.props.currentOffset + this.props.resultsPerPage) / this.props.resultsPerPage;

    this.buildPagination(responseJson);
    this.buildResults(responseJson);
  }

  buildPagination(responseJson) {
    body.innerHTML = Util.loadTemplate('streamResults.tpl', {
      numResults:   responseJson._total,
      currentPage:  this.props.currentPage,
      totalPages:   this.props.totalPages
    });

    let paginationLinks = document.querySelectorAll('#pagination-links li.previous, #pagination-links li.next');
    for (var i=0; i<paginationLinks.length; i++) {
      paginationLinks[i].style.display = 'none';
    }
    if (this.props.currentPage < this.props.totalPages) {
      document.querySelector('#pagination-links li.next').style.display = 'block';
    }
    if (this.props.currentPage > 1) {
      document.querySelector('#pagination-links li.previous').style.display = 'block';
    }

    this.bindPaginationListeners();
  }

  bindPaginationListeners() {
    let me = this;
    document.getElementById('pagination-links')
    .addEventListener("click",
      (e) => me.paginationHandler(e),
      { capture: true, passive: false }
    );
    document.getElementById('pagination-links')
    .addEventListener("keydown",
      (e) => me.paginationHandler(e),
      { capture: true, passive: false }
    );
  }

  paginationHandler(e) {
    let className = e.target.className;
    if (className == 'previousLink' || className == 'nextLink') {
      let offset = (className == 'previousLink')
        ? this.props.currentOffset - this.props.resultsPerPage
        : this.props.currentOffset + this.props.resultsPerPage;

      this.sendSearchRequest(
        this.props.query,
        offset
      );
    }
  }

  buildResults(responseJson) {
    let resultHtml = '';
    for (let i=0; i<responseJson.streams.length; i++) {
      let record = responseJson.streams[i];
      resultHtml += Util.loadTemplate('streamRecord.tpl', {
        streamUrl:    record.channel.url,
        streamTitle:  record.channel.display_name,
        streamImage:  record.preview.medium,
        gameName:     record.game,
        numViewers:   record.viewers,
        streamDesc:   record.channel.status
      });
    }

    let container = document.getElementById('container');
    container.innerHTML = resultHtml;
  }

  showErrorMessage(e) {
    console.log(e);
  }
}

let streamSearch = new StreamSearch({
  currentOffset: 0,
  resultsPerPage: 10
});
