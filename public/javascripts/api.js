define('api',['jsonrpc','lodash'], function (JsonRpc,_) {
	"use strict";

	return {
		call:function () {
			var la = Array.prototype.slice.call(arguments);
			la.splice(1,0,_apiToken);
//			console.log(_apiToken);
			console.log(la);
			var cb = la[la.length-1];
			la[la.length-1] = {
				success: function (data) {
					data.splice(0,0,null);
					cb.apply(this,data);
				},
				failure: cb
			}
			require(['jsonrpc'], function (JsonRpc) {
				var rpc = new JsonRpc('/jsonrpc');
				rpc.call.apply(rpc, la)
			},cb)
		},
		batch:function (batch,cb) {
			require(['lodash','jsonrpc'], function (_,JsonRpc) {
				_.forEach(batch, function (s) {
					if (s.cmd == "api")
						s.prm.splice(1,0,_apiToken)
				})
				var rpc = new JsonRpc('/jsonrpc');
				rpc.call("batch.runBatch",batch,{
					success: function (data) {
						data.splice(0,0,null);
						cb.apply(this,data);
					},
					failure: cb
				})
			},cb)
		}
	}
});
