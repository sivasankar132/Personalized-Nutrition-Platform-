package com.nutrition.dashboard;

import com.getcapacitor.BridgeActivity;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
	@Override
	public void onBackPressed() {
		WebView webView = getBridge() == null ? null : getBridge().getWebView();
		if (webView == null) {
			super.onBackPressed();
			return;
		}

		webView.evaluateJavascript(
			"(function(){const modal=[...document.querySelectorAll('.fixed.inset-0')].find(el=>!el.classList.contains('hidden'));if(modal&&typeof closeModal==='function'){closeModal(modal.id);return true;}return false;})()",
			handled -> {
				if ("true".equals(handled)) return;
				if (webView.canGoBack()) {
					webView.goBack();
				} else {
					MainActivity.super.onBackPressed();
				}
			}
		);
	}
}
