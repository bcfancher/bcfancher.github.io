export default class Util {
  static loadTemplate(tplID, tokens) {
    var template = document.getElementById(tplID);
    if (!template) return false;

    var resultHtml = template.innerHTML;
    for (var key in tokens) {
      let value = tokens[key];
      resultHtml = Util.replaceAll(resultHtml, "{"+key+"}", value);
    }

    return resultHtml;
  }

  static replaceAll(str, find, replace) {
    return str.replace(new RegExp(Util.escapeRegExp(find), 'g'), replace);
  }

  static escapeRegExp(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }

  static extendObject(src, props, recursive=false) {
    let newObj = src;
    if (props  && typeof props == 'object') {
      for (let key in props) {
        if (recursive && newObj[key]
        && typeof newObj[key] == 'object' && typeof props[key] == 'object' ) {
          newObj[key] = Util.extendObject(newObj[key], props[key]);
        } else {
          newObj[key] = props[key];
        }
      }
    }

    return newObj;
  }
}
