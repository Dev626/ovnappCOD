// ng build --configuration=production
export const environment = {
    env: "production",
    production: true,
    protocol: "https",
    hostLocal : "app.codesociety.site",
    host : {
      // ovnMain : "cod.ovenfo.com/",
      // ovnADM  : "cod.ovenfo.com/",
      // ovnMNG  : "cod.ovenfo.com/",
      // ovnCOD  : "cod.ovenfo.com/",
      ovnMain : "app.codesociety.site/",
      ovnADM  : "app.codesociety.site/",
      ovnMNG  : "app.codesociety.site/",
      ovnCOD  : "app.codesociety.site/",
    },
    hostType : 2,
    hostBefore : "", 
    hostAfter : "", 
    firebase_coleccion_base : "OVN_PROD",
    rest: "", 
    service : "",
    firebase: {
      apiKey: "AIzaSyDSaO4789Zco5fy-wd4VrgAsYcMalNfKMM",
      authDomain: "stone-net-265023.firebaseapp.com",
      databaseURL: "https://stone-net-265023.firebaseio.com",
      projectId: "stone-net-265023",
      storageBucket: "stone-net-265023.appspot.com",
      messagingSenderId: "706486790340",
      appId: "1:706486790340:web:f489c27ee05b67138fc191",
      measurementId: "G-Y1PN9XVFXR"
    },
    version : "1.0.0",
    systemId : 98,
    mainModuleFree : true,
    default_languaje: "es",
    oauth_clientid : "API_APM_INLANDNET",
    oauth_secret : "33caa750333af31d49d39e9251ecb592"
};