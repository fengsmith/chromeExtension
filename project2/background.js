var count=[];
var urls=[];
var working=false;
var addr='N/A';
chrome.browserAction.setBadgeBackgroundColor({color:'#AA00AA'});
chrome.extension.onRequest.addListener(
  function(request,sender,sendResponse) {
    chrome.tabs.query(
      {active:true,currentWindow: true},
      function(d) {
        var tabid = [d[0].id]||0;
        sendResponse({"tabid":tabid});
      }
    )
  }
);

chrome.runtime.onInstalled.addListener(
  function(details) {
    if(details.reason==="install") {
      localStorage["gapi"]=true;
      localStorage["gana"]=true;
      localStorage["gser"]=false;
      localStorage["icon"]=true;
      localStorage["jque"]=true;
      window.open(chrome.extension.getURL('options.html'));
    }
  }
);

function push(details,department) {
  var tabid=details.tabId;
  if(tabid==-1) return;
  if(count[tabid]===undefined)
    count[tabid]=[];
  else if(count[tabid][details.requestId]===true)
    return;
  count[tabid][details.requestId]=true;
  if(urls[tabid]===undefined)
    urls[tabid]=[];
  urls[tabid].push([details.url,department]);
  chrome.browserAction.setBadgeText({text:urls[tabid].length.toString(),tabId:tabid});
}

chrome.tabs.onUpdated.addListener(
  function(tabId,changeInfo){
    if(changeInfo.status=="loading") {
      count[tabId]=undefined;
      urls[tabId]=undefined;
    }
  }
);

chrome.tabs.onRemoved.addListener(
  function(tabId){
    count[tabId]=undefined;
    urls[tabId]=undefined;
  }
);

function nogapi(details){
  var url=details.url;
  //try redirect jquery first
  var result=nojque(details);
  if(result['cancel']===undefined)
      return result;
  
  push(details,'重定向 Google API');
  return {redirectUrl: url.replace(".googleapis.com/",".useso.com/").replace('https://','http://')};
}
var nogapi_filter={
  urls:["*://ajax.googleapis.com/*","*://fonts.googleapis.com/*"],
  types:["stylesheet","script"]};

function nogana(details){
  push(details,'拦截谷歌统计');
  return {"cancel": true};
}
var nogana_filter={
  urls:["*://www.google-analytics.com/*"],
  types:["script","image","object","xmlhttprequest","other"]
};

function nogser(details){
  push(details,'拦截无效服务');
  return {"cancel": true};
}
var nogser_filter={
  urls:["*://*.google.com/*","*://*.youtube.com/*","*://*.facebook.com/*","*://*.twitter.com/*","*://*.googlecode.com/*","*://*.gravatar.com/*"],
  types:["sub_frame","stylesheet","script","image","object","xmlhttprequest","other"]
};

function nojque(details) {
  var url=details.url.split('/');
  if(url[2]==="libs.useso.com"||url[2]==="ajax.useso.com"||url[2]=="cdn.bootcss.com")
    return {cancel: false};
  var len=url.length;
  if(url[len-1]==="jquery.min.js") {
    if (jq_vers[url[len-2]]!==undefined) {
      push(details,"重定向 jQuery");
      return {redirectUrl: "https://cdn.bootcss.com/jquery/" + url[len-2] + "/jquery.min.js"};
    }
    else
      return {cancel: false};
  }
  var result=new RegExp("^jquery-(.+)\.min\.js$").exec(url[len-1]);
  if(result===null || jq_vers[result[1]]===undefined)
    return {cancel: false};
  else {
    push(details,"重定向 jQuery");
    return {redirectUrl: "https://cdn.bootcss.com/jquery/" + result[1] + "/jquery.min.js"};
  }
}
var nojque_filter={
  urls:["http://*/*/jquery*.min.js","http://*/jquery*.min.js"],
  types:["script"]
};
var jq_vers={
  '3.0.0-alpha1':true,'2.1.4':true,'2.1.3':true,'2.1.2':true,'2.1.1':true,'2.1.1-rc2':true,
  '2.1.1-rc1':true,'2.1.1-beta1':true,'2.1.0':true,'2.1.0-rc1':true,'2.1.0-beta3':true,
  '2.1.0-beta2':true,'2.0.3':true,'2.0.2':true,'2.0.1':true,'2.0.0':true,'1.11.3':true,
  '1.11.2':true,'1.11.1':true,'1.11.1-rc2':true,'1.11.1-rc1':true,'1.11.1-beta1':true,'1.11.0':true,
  '1.11.0-rc1':true,'1.11.0-beta3':true,'1.10.2':true,'1.10.1':true,'1.10.0':true,'1.9.1':true,
  '1.9.0':true,'1.8.3':true,'1.8.2':true,'1.8.1':true,'1.8.0':true,'1.7.2':true,'1.7.1':true,
  '1.7':true,'1.6.4':true,'1.6.2':true,'1.6.1':true,'1.4.4':true,'1.4.3':true,'1.4.2':true,
  '1.4.1':true,'1.4.0':true,'1.3.2':true,'1.3.1':true,'1.3.0':true,'1.2.6':true,'1.2.3':true };

function noicon(details){
  var url=details.url;
  push(details,'缓存Glyphicons');
  if(url[-1]=='2')
    return {redirectUrl: chrome.extension.getURL('libs/fonts/glyphicons-halflings-regular.woff2')};
  else
    return {redirectUrl: chrome.extension.getURL('libs/fonts/glyphicons-halflings-regular.woff')}
}
var noicon_filter={
  urls:[
    "http://*/*/glyphicons-halflings-regular.woff","http://*/*/glyphicons-halflings-regular.woff2",
    "https://*/*/glyphicons-halflings-regular.woff","https://*/*/glyphicons-halflings-regular.woff2"],
  types:["other"]
};

function bindreq() {
  working=true;
  chrome.browserAction.setIcon({path:'icons/action.png'});
  if(localStorage["gapi"]==='true')
    chrome.webRequest.onBeforeRequest.addListener(nogapi,nogapi_filter,["blocking"]);
  if(localStorage["gana"]==='true')
    chrome.webRequest.onBeforeRequest.addListener(nogana,nogana_filter,["blocking"]);
  if(localStorage["gser"]==='true')
    chrome.webRequest.onBeforeRequest.addListener(nogser,nogser_filter,["blocking"]);
  if(localStorage["icon"]==='true')
    chrome.webRequest.onBeforeRequest.addListener(noicon,noicon_filter,["blocking"]);
  if(localStorage["jque"]==="true")
    chrome.webRequest.onBeforeRequest.addListener(nojque,nojque_filter,["blocking"]);
}
function unbind(willrebind) {
  working=false;
  if(!willrebind) {
    chrome.browserAction.setIcon({path:'icons/disabled.png'});
    chrome.browserAction.setBadgeText({text:''});
  }
  chrome.webRequest.onBeforeRequest.removeListener(nogapi,nogapi_filter,["blocking"]);
  chrome.webRequest.onBeforeRequest.removeListener(nogana,nogana_filter,["blocking"]);
  chrome.webRequest.onBeforeRequest.removeListener(nogser,nogser_filter,["blocking"]);
  chrome.webRequest.onBeforeRequest.removeListener(noicon,noicon_filter,["blocking"]);
  chrome.webRequest.onBeforeRequest.removeListener(nojque,nojque_filter,["blocking"]);
}

function checkNetwork() {
  var xhr = new XMLHttpRequest();
  xhr.open('get', 'http://api.map.baidu.com/location/ip?ak=cSjy2WQz2Kmhqcfgs6LGm18Q', true);
  xhr.onload = function () {
    var result = JSON.parse(xhr.responseText);
    if (result['status'] !== 0) {
      addr = "海外";
      unbind();
      return;
    }
    addr = result['address'].split('|')[1];
    if (result['address'].split('|')[0] === 'CN')
      bindreq();
    else
      unbind();
  };
  xhr.onerror = xhr.onabort = xhr.ontimeout = function (event) {
    addr = "（网络错误，无法获取）";
  };
  xhr.setRequestHeader("If-Modified-Since", "0");
  xhr.send();
}

function startCheckNetwork(firstrun) {
  checkNetwork();
  window.netchk=setInterval(checkNetwork,10*1000);
  if(firstrun===true)
    chrome.permissions.contains({permissions: ['idle']},function(result) {
      if (result) {
        chrome.idle.setDetectionInterval(15);
        chrome.idle.onStateChanged.addListener(function(details) {
          stopCheckNetwork();
          if(details==="active")
            window.netchk=setInterval(checkNetwork,10*1000);
          else
            window.netchk=setInterval(checkNetwork,60*1000);
        });
      }
    });
}
function stopCheckNetwork() {
  clearInterval(netchk);
}

if(localStorage["netchk"]==="true")
  startCheckNetwork(true);
bindreq();