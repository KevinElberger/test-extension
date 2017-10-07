(function() {
    function getCampaignData() {
      if (typeof usi_js === 'undefined') {
        return;
      }
      document.dispatchEvent(new CustomEvent('usiEvent', {
        detail: usi_js.campaign
      }));
      document.dispatchEvent(new CustomEvent('usiImages', {
        detail: usi_js.display_vars
      }));
    }
  
    function getPixelData() {
      if (typeof USI_orderID === 'undefined' || typeof USI_orderAmt === 'undefined') {
        return;
      }
      let data = { orderAmt: USI_orderAmt, orderID: USI_orderID };
      document.dispatchEvent(new CustomEvent('usiPixel', {
        detail: data
      }));
    }
  
    function usi_mouse_out(event) {
      let e = event.toElement || event.relatedTarget;
  
      if (typeof usi_js === 'undefined') {
        return;
      }
      if (e === null || e.nodeName === 'HTML') {
        usi_js.mouse_info.is_mouse_over_page = 0;
        if (usi_js.mouse_info.last_seen_timestamp != -1) usi_js.mouse_info.total_time_over_page += (Number(new Date()) - usi_js.mouse_info.last_seen_timestamp);
        if (usi_js.mouse_info.total_time_over_page < usi_js.launch.time_hover_requirement) {
          document.dispatchEvent(new CustomEvent('usiDebug', {
            detail: {msg: `not on page long enough: ${usi_js.mouse_info.total_time_over_page}`}
          }));
          return;
        }
        if (usi_js.launch.any_trajectory == 0 && usi_js.mouse_info.last_mouse_y > usi_js.launch.content_start) {
          document.dispatchEvent(new CustomEvent('usiDebug', {
            detail: {msg: 'exit from non-top movement area ' + usi_js.mouse_info.last_mouse_y}
          }));
          return;
        }
        if ((Number(new Date()) - usi_js.mouse_info.on_page_timestamp) > usi_js.launch.speed_upward ) {
          document.dispatchEvent(new CustomEvent('usiDebug', {
            detail: {msg: 'slow approach: ' + (Number(new Date()) - usi_js.mouse_info.on_page_timestamp) + 'ms'}
          }));
          return;
        }
        if (usi_js.mouse_info.last_mouse_x/screen.width <= usi_js.launch.no_pop_quadrant/100) {
          document.dispatchEvent(new CustomEvent('usiDebug', {
            detail: {msg: 'too far to the left ' + (usi_js.mouse_info.last_mouse_x/screen.width) + '%'}
          }));
          return;
        }
        usi_js.mouse_info.last_seen_timestamp = Number(new Date());
        if ((usi_js.launch.any_trajectory == 1 || usi_js.mouse_info.trajectory == 'up') && usi_js.timers.display_timer == -1) {
          if (usi_js.launch.launch_methods.indexOf(usi_js.PREDICTIVE_METHOD) != -1) {
            if (usi_js.page_status.focus == 'focus') usi_js.page_status.focused_at_exit = 1;
            else  usi_js.page_status.focused_at_exit = 0;
            usi_js.timers.display_timer = setTimeout ( "usi_js.display(false)", usi_js.launch.time_above_y );
          }
        }
      }
    }
  
    if (document.attachEvent) {
      document.attachEvent('mouseout', usi_mouse_out);
    } else if (document.addEventListener) {
      document.addEventListener('mouseout', usi_mouse_out);
    }
    setInterval(getCampaignData, 1000);
    setInterval(getPixelData, 1000);
  }());