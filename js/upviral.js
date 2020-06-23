var Upviral = function(e, t) {
    "use strict";
    var n, i = function() {
            for (var e = document.querySelectorAll('[href="#uvembed' + n.camp + '"]'), t = 0; t < e.length; t++) e[t].addEventListener("click", a)
        },
        a = function(e) {
            e.preventDefault(), syncFrame.style.display = "block"
        },
        o = function(e) { // This simply looks up url query string
            for (var n = t.location.search.substring(1).split("&"), i = 0; i < n.length; i++) {
                var a = n[i].split("=");
                if (a[0] == e) return a[1]
            }
        },
        l = function(e, i) {
            var a = t.location.hostname + t.location.pathname,
                c = document.cookie.indexOf("upviral_user_id") >= 0 || document.cookie.indexOf("upviral_user_id" + n.camp) >= 0 ? u("upviral_user_id") : "",
                l = document.cookie.indexOf("referral_url") >= 0 || document.cookie.indexOf("referral_url" + n.camp) >= 0 ? u("referral_url") : "",
                r = document.cookie.indexOf("s_track" + n.camp) >= 0 ? u("s_track") : "",
		// Giorgio, look at uvmail and uvname from UpviralConfig as well, not just query strings
                d = o("uvemail") ? o("uvemail") : t.UpviralConfig.uvemail ? t.UpviralConfig.uvemail : "",
                p = o("uvname") ? o("uvname") : t.UpviralConfig.uvname ? t.UpviralConfig.uvname : "",
                s = document.getElementById(n.cid) || document.getElementsByClassName(n.cid).length > 0 ? "yes" : "no";
            m.send(n.api_url + "embed/camp-info/call/ajax/onJSONPLoad/Upviral.campaignDetail/", {
                callbackName: "Upviral.campaignDetail",
                timeout: 20,
                data: "0=0&camp=" + n.camp + "&current_url=" + a + "&lead_id=" + c + "&ref_id=" + l + "&s_track=" + r + "&uvemail=" + d + "&uvname=" + p + "&is_widget=" + s
            })
        },
        r = function(e, t) {
            return e ? t + "/" + e + "/" : ""
        },
        d = function() {
            n.temp = "if";
            for (var e = n.width ? n.width : "100%", t = document.getElementsByClassName(n.cid), i = 0; i < t.length; i++) {
                var a = t[i].parentElement.clientWidth;
                e = n.width && "px" == n.width.match(/[a-z]+|\d+/gi)[1] && a && a < n.width.match(/[a-z]+|\d+/gi)[0] ? a + "px" : n.width ? n.width : "100%", t[i].style.width = e
            }
            if (document.getElementById(n.cid)) {
                a = document.getElementById(n.cid).parentElement.clientWidth;
                n.width && "px" == n.width.match(/[a-z]+|\d+/gi)[1] && a && a < n.width.match(/[a-z]+|\d+/gi)[0] && (e = a + "px"), document.getElementById(n.cid).style.width = e
            }
        },
        m = {
            send: function(e, n) {
                var i = n.callbackName || "callback",
                    a = n.onSuccess || function() {},
                    c = n.onTimeout || function() {},
                    o = n.timeout || 10,
                    l = t.setTimeout(function() {
                        t[i] = function() {}, c()
                    }, 1e3 * o);
                t[i] = function(e) {
                    t.clearTimeout(l), a(e)
                };
                var r = document.createElement("script");
                r.type = "text/javascript", r.async = !0, r.src = e + n.data, document.getElementsByTagName("head")[0].appendChild(r)
            }
        },
        u = function(e) {
            var t = e + n.camp;
            if (!(i = new RegExp(t + "=([^;]+)").exec(document.cookie))) var i = new RegExp(e + "=([^;]+)").exec(document.cookie);
            return null != i ? unescape(i[1]) : null
        },
        p = function(e, t, i) {
            var a = new Date,
                c = a.getTime(),
                o = c + 31536e6;
            i && (o = c + 864e5 * t), a.setTime(o);
            var l = e + n.camp;
            document.cookie = l + "=" + t + ";expires=" + a.toGMTString() + ";path = /;"
        },
        f = function(e, t) {
            var i = "";
            t && (i = "/s_track/" + t);
            for (var a = n.api_url + "site/parse_new_users/call/ajax/campId/" + n.camp + i + "/reflink/" + e, c = document.getElementsByTagName("form"), o = 0; o < c.length; o++) {
                var l = c[o].action;
                if ("string" == typeof l) l.indexOf("parse_new_users") > -1 && (c[o].action = a);
                document.getElementsByName("reflink")[o] && (document.getElementsByName("reflink")[o].value = e)
            }
        },
        y = function(e) {
            for (var t = ["S", "$", "M", "A", "&", "R", "8", "(", "G", "4"], n = "", i = 0; i < e.length; i++) {
                n += t.indexOf(e[i])
            }
            var a = n.split("").reverse().join("");
            return a = (a - 5286) / 2
        },
        v = function() {
            var e = t.addEventListener ? "addEventListener" : "attachEvent";
            (0, t[e])("attachEvent" == e ? "onmessage" : "message", function(e) {
                var t = e.data.split(",")[0],
                    i = e.data.split(",")[1],
                    a = e.data.split(",")[2];
                "if_height" == t && (void 0 !== a ? document.getElementsByClassName(n.cid)[a].style.height = i + "px" : document.getElementById(n.cid) && (document.getElementById(n.cid).style.height = i + "px"));
                "Close" == e.data && (syncFrame.style.display = "none", n.close_days && p("closepopup", n.close_days, n.close_days)), "uvid" == t && p("upviral_user_id", i)
            }, !1)
        };
    return {
        initialize: function(e) {
            (n = e).camp = y(n.camp), n.cid = "uvembed" + n.camp, n.api_url = "https://app.upviral.com/";
            var t = o("ref_id");
            t && p("referral_url", t), (a = o("track")) && p("s_track", a);
            var a, c = u("referral_url"),
                r = u("s_track");
            if ((c || r) && (f(c, r), setTimeout(function() {
                    f(c, r)
                }, 1500)), 1 == n.html) return !1;
            if (n.widget_style && "popup" == n.widget_style) {
                if (document.getElementById(n.cid)) {
                    var d = document.getElementById(n.cid);
                    d.parentNode.removeChild(d)
                }
                for (var m = document.getElementsByClassName(n.cid), s = m.length - 1; s >= 0; s--) m[s].parentNode.removeChild(m[s])
            }(a = o("uId")) && p("upviral_user_id", a), l(t, a), i(), setTimeout(function() {
                i()
            }, 2e3)
        },
        campaignDetail: function(e) {
            if (e)
                if ("uv" == e.camp_type) t.location.href = e.target_url;
                else {
                    if (void 0 == n.opacity || n.opacity || (n.opacity = "zero"), document.getElementById(n.cid) || document.getElementsByClassName(n.cid)) {
                        for (var i = e.target_url + r(n.template_id, "template") + r(n.widget_style, "widget") + r(n.close_popup, "close_popup") + r(n.opacity, "opacity"), a = document.getElementsByClassName(n.cid), o = 0; o < a.length; o++)
                            if (a[o].src = i + "k/" + o, 0 == o) {
                                i += "v/n/";
                                var l = 1
                            } document.getElementById(n.cid) && (document.getElementById(n.cid).src = i), d()
                    }
                    if (!document.getElementById("uvpopup" + n.camp) && (document.querySelectorAll('[href="#uvembed' + n.camp + '"]').length > 0 || "popup" == n.widget_style)) {
                        "iframe" == n.widget_style && (n.close_popup = "yes");
                        var m = document.createElement("iframe");
                        i = e.target_url + r(n.template_id, "template") + r("popup", "widget") + r(n.close_popup, "close_popup") + r(n.opacity, "opacity"), i = l ? i + "v/n/" : i, t.syncFrame = m, m.id = "uvpopup" + n.camp, m.frameBorder = 0, m.style.cssText = "z-index: 9999999999", m.style.display = "none", m.style.width = "100%", m.style.height = "100%", m.style.position = "fixed", m.style.top = 0, m.style.left = 0, m.src = i, document.body ? document.body.appendChild(m) : s.parentNode.insertBefore(m, s), "popup" == n.widget_style && document.cookie.indexOf("closepopup" + n.camp) < 0 && (syncFrame.style.display = "block")
                    }
                    e && e.powered && setTimeout(function() {
                        var t = document.createElement("div");
                        t.setAttribute("id", "uvp"), document.getElementsByTagName("body")[0].appendChild(t), document.getElementById("uvp").innerHTML = e.powered
                    }, 1500), v()
                }
        }
    }
}(document, window);
UpviralConfig.camp ? Upviral.initialize(UpviralConfig) : console.error("Upviral configuration error.");
