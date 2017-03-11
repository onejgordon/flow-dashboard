var $ = require('jquery');
var AppConstants = require('constants/AppConstants');
var toastr = require('toastr');

var api = {

	post: function(url, data, success, fail, opts) {
		var no_success_bool = opts && opts.no_success_bool;
		$.post(url, data, function(res, status, jqxhr) {
			var status = jqxhr.status;
			if (res) {
				if (res.message) {
					if (res.success) toastr.success(res.message);
					else toastr.error(res.message);
				}
				if ((res.success || no_success_bool) && typeof(success)==='function') success(res);
				if (!no_success_bool && !res.success) {
					if (typeof(fail)==='function') fail(res);
				}
			}
		}, 'json').fail(function(jqxhr, textStatus, errorThrown) {
			var status = jqxhr.status;
			toastr.error("An unknown error has occurred");
			if (status == 401) {
				localStorage.removeItem(AppConstants.USER_STORAGE_KEY);
				window.location = "/app/public";
			}
			if (typeof(fail) === 'function') fail();
		});
	},

	get: function(url, data, success, fail, opts) {
		var no_toast = opts && opts.no_toast;
		$.getJSON(url, data, function(res, _status, jqxhr) {
			var status = jqxhr.status;
			if (res) {
				if (res.message && !no_toast) {
					if (res.success) toastr.success(res.message);
					else toastr.error(res.message);
				}
				if (res.success && typeof(success)==='function') success(res);
				if (!res.success) {
					if (typeof(fail)==='function') fail(res);
				}
			}
		}).fail(function(jqxhr, textStatus, errorThrown) {
			var status = jqxhr.status;
			if (status == 401) {
				localStorage.removeItem(AppConstants.USER_STORAGE_KEY);
				window.location = "/app/public";
			}
			toastr.error("An unknown error has occurred");
			if (typeof(fail) === 'function') fail();
		});
	}

}

export default api;