var $ = require('jquery');
var moment = require('moment-timezone');

var util = {

    ListPop: function(keyval, list, _key) {
        var key = _key || "id";
        for (var i=0; i<list.length; i++) {
            var li_el = list[i];
            if (li_el[key] == keyval) {
                list.pop(i);
            }
        }
    },

    colorInterpolate: function(opts) {
        // Takes opts
        // color1, color2 - hex without # e.g. 'FF0000'
        // min, max, value, from which ratio is calculated
        // OR
        // ratio
        var color1 = opts.color1;
        var color2 = opts.color2;
        var min = opts.min || 0;
        var max = opts.max || 100;
        var value = opts.value || 0;
        if (value < min) value = min;
        if (value > max) value = max;
        var ratio = 0.0;
        if (min!=null && max!=null && value!=null) {
            ratio = (value - min) / (max - min);
        } else if (opts.ratio) {
            ratio = opts.ratio;
        }
        var hex = function(x) {
            x = x.toString(16);
            return (x.length == 1) ? '0' + x : x;
        };

        var r = Math.ceil(parseInt(color2.substring(0,2), 16) * ratio + parseInt(color1.substring(0,2), 16) * (1-ratio));
        var g = Math.ceil(parseInt(color2.substring(2,4), 16) * ratio + parseInt(color1.substring(2,4), 16) * (1-ratio));
        var b = Math.ceil(parseInt(color2.substring(4,6), 16) * ratio + parseInt(color1.substring(4,6), 16) * (1-ratio));
        var res_c = hex(r) + hex(g) + hex(b);
        return res_c;
    },

    url_summary(url) {
        url = url.replace('http://','');
        url = url.replace('https://','');
        url = url.replace('www.','');
        return util.truncate(url, 25);
    },


    updateByKey: function(item, items, _keyattr, _do_delete) {
        var success = false;
        var do_delete = _do_delete || false;
        var keyattr = _keyattr || "key";
        for (var i=0; i<items.length; i++) {
          var _item = items[i];
          if (_item) {
            var keyval = _item[keyattr];
            if (keyval == item[keyattr]) {
              // Match
              if (do_delete) items.splice(i, 1);
              else items[i] = item;
              success = true;
              break;
            }
          }
        }
        return success;
    },

    objectIndexOf: function(key, list, _keyattr) {
        var keyattr = _keyattr || "id";
        for (var i=0; i<list.length; i++) {
            var li_el = list[i];
            if (li_el[keyattr] == key) {
                return i;
            }
        }
        return -1;
    },

    _render: function(html, directive, data) {
        compiled = $(html).compile(directive);
        var el = $(html).render(data, compiled);
        return el;
    },

    contains: function(list, val) {
        for (k = 0; k < list.length; k++) {
            if (val == list[k]) {
                return 1;
            }
        }
        return 0;
    },

    baseUrl: function() {
        var base_url = location.protocol + '//' + location.host + location.pathname;
        return base_url;
    },

    nowTimestamp: function() {
        // Millis
        return Date.now();
    },

    printDate: function(ms, _format) {
        if (ms == null) return "";
        // Using moment.js to print local date/times
        let format = _format == null ? "YYYY-MM-DD" : _format;
        var dt = moment(parseInt(ms));
        return dt.format(format);
    },

    daysInMonth: function(month,year) {
        return new Date(year, month, 0).getDate();
    },

    dayOfYear: function(now) {
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = now - start;
        let oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    },

    printDateObj: function(date, _timezone, opts) {
        if (_timezone && moment) {
            // Using moment.js to print local date/times
            var dt = moment.tz(date.getTime(), _timezone);
            let format = "YYYY-MM-DD";
            if (opts) {
                if (opts.format) format = opts.format;
                else if (opts['_with_time']) format = "YYYY-MM-DD HH:mm";
            }
            return dt.format(format);
        } else {
            if (date != null) {
                var d = date.getDate();
                var month = date.getMonth() + 1;
                var day = d<10? '0'+d:''+d;
                if (month < 10) month = '0'+month;
                return date.getFullYear()+"-"+month+"-"+day;
            } else return "--";
        }
    },

    printISODate: function(ts) {
        var newDate = new Date();
        newDate.setTime(ts*1000);
        var year = newDate.getFullYear();
        var day = newDate.getDate();
        var month = newDate.getMonth();
        var dt = year+'-'+(month+1)+'-'+day;
        return dt;
    },

    timestamp: function() {
        // Seconds
        return parseInt(new Date().getTime() / 1000);
    },

    printMonthDay: function(ts) {
        var newDate = new Date();
        newDate.setTime(ts*1000);
        var month = newDate.getMonth()+1;
        var day = newDate.getDate();
        return day+'/'+month;
    },

    startAutomaticTimestamps: function(_tz, _interval) {
        var tz = _tz || "UTC";
        var interval = _interval || 20; // Secs
        util.printTimestampsNow(null, null, null, tz);
        var interval_id = setInterval(function() {
            util.printTimestampsNow(null, null, null, tz);
        }, 1000*interval);
        return interval_id;
    },

    from_now(ms) {
        return moment(ms).fromNow();
    },

    hours_until(ms) {
        let now = new Date().getTime();
        let secs_until = Math.round((ms - now)/1000);
        return parseInt(secs_until / 60.0 / 60.0);
    },

    timesince(ms) {
        let LEVELS = [
            { label: "second", cutoff: 60, recent: true, seconds: 1 },
            { label: "minute", cutoff: 60, seconds: 60 },
            { label: "hour", cutoff: 24, seconds: 60*60 },
            { label: "day", cutoff: 30, seconds: 60*60*24 }
        ];
        let text;
        let recent = false;
        let very_old = false;
        let now = new Date().getTime();
        let secs_since = Math.round((now - ms)/1000);
        let handled = false;
        let full_date = util.printDate(ms);
        for (let i=0; i<LEVELS.length; i++) {
            let level = LEVELS[i];
            let units_since = secs_since / level.seconds;
            if (units_since < level.cutoff) {
                if (level.recent) recent = true;
                text = parseInt(units_since) + " " + level.label + "(s) ago";
                handled = true;
                break;
            }
        }
        if (!handled) {
            very_old = true;
            text = full_date;
        }
        return { very_old, text, full_date, recent };
    },

    printTimestampsNow: function(_smart, _row_sel, _recent_class, _timezone) {
        var row_sel = _row_sel || 'li';
        var recent_class = _recent_class || 'list-group-item-info';
        var smart = smart == null ? true : _smart;
        $('[data-ts]').each(function() {
            var ts = $(this).attr('data-ts');
            if (smart) {
                let {very_old, text} = util.timesince(ts);
                if (!handled) {
                    // Remove _ts since this is too old for relative time
                    $(this).removeAttr('data-ts');
                }
            } else text = full_date;
            $(this).text(text).attr('title', full_date);
        });
    },

    printPercent: function(dec) {
        return parseInt(dec*100) + "%";
    },

    uppercaseSlug: function(str) {
        return str.replace(/[^A-Z0-9]+/ig, "_").toUpperCase();
    },

    truncate: function(s, _chars) {
        var chars = _chars || 30;
        if (s.length > chars) return s.substring(0, _chars) + '...';
        else return s;
    },

    getParameterByName: function(name, _default) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? _default || "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    getHash: function() {
        return window.location.hash.substr(1);
    },

    randomId: function(length) {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    },

    doOnKeypress: function(keycodes, fn) {
        if (!(keycodes instanceof Array)) keycodes = [keycodes];
        $(document).keyup(function(e) {
            if (keycodes.indexOf(e.keyCode) > -1 && fn) { fn(); }
        });
    },

    mergeObject: function(obj1, obj2) {
        // Merge obj2 into obj1
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
    },

    arrToObj: function(arr, keyname) {
        var obj = {};
        arr.forEach(function(item, i, arr) {
            obj[item[keyname]] = item;
        });
        return obj;
    },

    printFilesize: function(bytes) {
        var MB = 1000000, KB = 1000;
        if (bytes != null) {
            if (bytes > MB) return (bytes/MB).toFixed(1) + ' MiB';
            else if (bytes > KB) return (bytes/KB).toFixed(1) + ' KiB';
            else return (bytes).toFixed(1) + ' bytes';
        } else return "--";
    },

    dateToTimestamp: function(date_string) {
        var dc = date_string.split('/');
        var date = new Date(dc[2], dc[0], dc[1]);
        console.log(date.getTime());
        return date.getTime();
    },

    addEvent: function(element, eventName, callback) {
        if (element.addEventListener) {
            element.addEventListener(eventName, callback, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + eventName, callback);
        } else {
            element["on" + eventName] = callback;
        }
    },

    applySentenceCase: function(str) {
        return str.replace(/.+?[\.\?\!](\s|$)/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    float2rat: function(x) {
        var tolerance = 1.0E-6;
        var h1=1; var h2=0;
        var k1=0; var k2=1;
        var b = x;
        do {
            var a = Math.floor(b);
            var aux = h1; h1 = a*h1+h2; h2 = aux;
            aux = k1; k1 = a*k1+k2; k2 = aux;
            b = 1/(b-a);
        } while (Math.abs(x-h1/k1) > x*tolerance);

        return h1+":"+k1;
    },

    stripNonNumbers: function(text) {
        return text.replace(/[^0-9]*/g, '');
    },

    stripSpaces: function(text) {
        return text.replace(/ /g,'');
    },

    strip: function(text) {
        return String(text).replace(/^\s+|\s+$/g, '');
    },

    replaceAt: function(index, s, character) {
        return s.substr(0, index) + character + s.substr(index+character.length);
    },

    countChars: function(s, character) {
        return s.split(character).length - 1;
    },

    initAppCache: function() {
        appCache = window.applicationCache;
        appCache.addEventListener('updateready', function(e) {
            if (appCache.status == appCache.UPDATEREADY) {
                // Browser downloaded a new app cache.
                // Swap it in and reload the page to get the new hotness.
                appCache.swapCache();
                var r = confirm('A new version of this site is available... Please reload now');
                if (r) location.reload(true);
            }
        }, false);
        var status;
        switch (appCache.status) {
            case appCache.UNCACHED: // UNCACHED == 0
                status = 'UNCACHED';
                break;
            case appCache.IDLE: // IDLE == 1
                status = 'IDLE';
                break;
            case appCache.CHECKING: // CHECKING == 2
                status = 'CHECKING';
                break;
            case appCache.DOWNLOADING: // DOWNLOADING == 3
                status = 'DOWNLOADING';
                break;
            case appCache.UPDATEREADY: // UPDATEREADY == 4
                status = 'UPDATEREADY';
                break;
            case appCache.OBSOLETE: // OBSOLETE == 5
                status = 'OBSOLETE';
                break;
            default:
                status = 'UKNOWN CACHE STATUS';
                break;
        };
        console.log("[ AppCache ] Status: " + status);
    },

    countWithCeiling: function(count, ceiling) {
        if (count == ceiling) return count + "+";
        else return count;
    },

    arrEquals: function(array, array2) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time
        if (array2.length != array.length)
            return false;

        for (var i = 0, l=array2.length; i < l; i++) {
            // Check if we have nested arrays
            if (array2[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!array2[i].equals(array[i]))
                    return false;
            }
            else if (array2[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    },

    stripSymbols: function(text) {
        return text.replace(/[^A-Za-z 0-9]*/g, '');
    },

    randomInt: function(min, max) {
        return Math.floor((Math.random() * max) + min);
    },

    listMessageVariables: function(s) {
        if (s != null) {
            var re = /\[[A-Z_-]*?\]/g;
            return s.match(re);
        } else return null;
    },

    emptyArray: function(len, item) {
        var item = item === undefined ? null : item;
        var arr = [];
        for (var i=0; i<len; i++) {
            arr.push(item);
        }
        return arr;
    },

    clone: function(obj) {
        var o2 = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                o2[key] = obj[key];
            }
        }
        return o2;
    },

    getRandomColor: function() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    average: function(arr) {
        if (arr.length > 0) {
            var sum = 0;
            let count = 0;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] != null) {
                    sum += arr[i];
                    count += 1;
                }
            }
            return sum / count;
        } else return 0;
    },

    capitalize: function(s) {
        if (s==null) return null;
        else {
            s = s.toLowerCase();
            return s.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
        }
    },

    dayDiff: function(firstDate, secondDate) {
        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
        return diffDays;
    },

    dateOffset: function(oldDate, _days, _months, _years) {
        var days = _days || 0;
        var months = _months || 0;
        var years = _years || 0;
        return new Date(oldDate.getFullYear()+years,oldDate.getMonth()+months,oldDate.getDate()+days);
    },

    catchJSErrors: function() {
        window.onerror = function(msg, url, line, col, error) {
           // Note that col & error are new to the HTML 5 spec and may not be
           // supported in every browser.  It worked for me in Chrome.
           var extra = !col ? '' : '\ncolumn: ' + col;
           extra += !error ? '' : '\nerror: ' + error;

           // You can view the information in an alert to see things working like this:
           alert("An error has occurred. Share this with the Echo Development team for assistance: " + msg + "\nurl: " + url + "\nline: " + line + extra);

           var suppressErrorAlert = true;
           // If you return true, then error alerts (like in older versions of
           // Internet Explorer) will be suppressed.
           return suppressErrorAlert;
        };
    },

    toggleInList: function(list, item) {
        var i = list.indexOf(item);
        if (i > -1) list.splice(i, 1);
        else list.push(item);
        return list;
    },

    stringToColor: function(str) {
        // str to hash
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
        // int/hash to hex
        for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
        return colour;
    },

    lookupDict: function(itemlist, _keyprop) {
        var keyprop = _keyprop || 'id';
        var lookup = {}
        itemlist.forEach(function(item, i, arr) {
            lookup[item[keyprop]] = item;
        });
        return lookup;
    },

    flattenDict: function(dict) {
        let list = [];
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                list.push(dict[key]);
            }
        }
        return list;
    },

    fromCents: function(cents) {
        return cents / 100.0;
    },

    toCents: function(units) {
        units = units.replace(',','');
        return parseFloat(units) * 100.0;
    },

    fixedNumber: function(num, _decimals) {
        var decimals = _decimals == null ? 2 : _decimals;
        return parseFloat(Math.round(num * 100) / 100).toFixed(decimals);
    },

    numberWithCommas: function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },

    serializeObject: function(jqel) {
        var o = {};
        var a = jqel.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    },

    type_check(value, type) {
        // Type is a string matching google visualization types
        // Returns value standardized to given type
        if (type == "number") value = parseFloat(value);
        return value;
    },

    set_title(title) {
        if (title != null) title = title + " | Gestalt";
        else title = "Gestalt";
        document.title = title;
    },

    spread_array(obj, from_prop, to_prop, n) {
        if (obj[from_prop]) {
            for (let i=0; i<n; i++) {
                let key = to_prop + (i+1);
                obj[key] = obj[from_prop][i];
            }
        }
        return obj;
    },

    transp_color(hex_color, brightness) {
        let opacity_prefix = (parseInt(255*brightness)).toString(16).toUpperCase();
        if (hex_color.startsWith('#')) hex_color = hex_color.slice(1).toUpperCase();
        return `#${opacity_prefix}${hex_color}`;
    },

    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    secsToDuration: function(secs) {
        let labels = ["hour", "minute", "second"];
        let d = moment.duration(secs, "seconds");
        let hours = parseInt(d.asHours());
        let mins = parseInt(d.minutes());
        let _secs = parseInt(d.seconds());
        let s = [];
        [hours, mins, _secs].forEach(function(p, i) {
            let label = labels[i];
            if (p > 0) {
                let piece = p + " " + label;
                if (p > 1) piece += "s";
                s.push(piece);
            }
        });
        if (s.length > 0) return s.join(', ');
        else return "0 seconds";
    }

}

module.exports = util;