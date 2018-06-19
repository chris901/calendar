
window.onload=function() {
    var d2=document.getElementById("d2");
    var details=document.getElementsByClassName("details")[0];
    var nstr=new Date(),//当天时间
        now_year=nstr.getFullYear() ,//年份
        now_month=nstr.getMonth()+1, //月份
        now_day=nstr.getDate(), //日期
        thisDay=now_year+'年'+now_month+'月'+now_day+'日';
    touchMove(now_year,now_month,now_day)
    todayMove()
    setStorage()
    details.innerHTML='';
    searchRender(thisDay)

};
function alterLi(){
    var oLi=document.getElementsByClassName("detailsLi");

    for (var i=0;i<oLi.length;i++){
        oLi[i].onclick=function(){
            var oId= parseInt(this.id);
            window.location.href="./alterDetail.html";
            renderDataByKey(oId)
        }
    }
}

function setStorage(){
    var more=document.getElementsByClassName("moreDetail")[0];
    more.onclick=function(){
        var yearMonth=document.getElementsByClassName("yearMonth")[0].innerHTML;
        var cDay=document.getElementsByClassName("iDay1")[0].innerHTML;
        var cWeek=document.getElementsByClassName("cWeek")[0].innerHTML;
        sessionStorage.setItem("yearMonth",yearMonth);
        sessionStorage.setItem("cDay",cDay);
        sessionStorage.setItem("cWeek",cWeek);
    }
}

function touchMove(now_year,now_month,now_day) {
    createCalendar(now_year,now_month,now_day)
    renderHtmlTop(now_year,now_month,now_day)
    document.getElementsByClassName("calendarBox")[0].addEventListener("touchstart",function(ev) {
        var e = ev || window.event;
        this.moveStartX = e.changedTouches[0].clientX;
        this.moveStartY = e.changedTouches[0].clientY;
    });
    document.getElementsByClassName("calendarBox")[0].addEventListener("touchend",function(ev) {
        var e = ev || window.event,
            self = this,
            mode = true;
        this.moveEndX = e.changedTouches[0].clientX;
        this.moveEndY = e.changedTouches[0].clientY;

        if(Math.abs(this.moveEndY - this.moveStartY)>40) {
            mode = false;
        }
        //下个月
        if(this.moveStartX-this.moveEndX>60 && mode){
            d2.style.opacity= '0';
            chooseMonth('next');
            AddClass('rightmove');
            createCalendar(now_year,now_month)
            renderHtmlTop(now_year,now_month,now_day)
            loadAll()


            //          上个月
        }else if(this.moveEndX-this.moveStartX>60 && mode){
            d2.style.opacity= '0';
            AddClass('leftmove');
            chooseMonth('pre');
            createCalendar(now_year,now_month)
            renderHtmlTop(now_year,now_month,now_day)
            loadAll()

        }
    });

//      月份判断
    function chooseMonth(time){
        if(time=='next'){
            if(now_month==12){
                now_month=1;
                now_year=now_year+1;
            }else{
                now_month=now_month+1;
            }
        }else if(time=='pre'){
            if(now_month==1){
                now_month=12;
                now_year=now_year-1;
            }else{
                now_month=now_month-1
            }
        }
    };
//      添加类
    function AddClass(classname){
        d2.classList.remove("leftmove");
        d2.classList.remove("rightmove");
        setTimeout(function () {
            d2.classList.add(classname)
        },50)
    };
}
//返回今天
function todayMove() {
    var details=document.getElementsByClassName("details")[0];
    document.getElementsByClassName("jin")[0].addEventListener("click", function () {
        var today = new Date();
        now_year = today.getFullYear(); //年份
        now_month = today.getMonth() + 1;//月份
        now_day = today.getDate(); //日期
        var thisDay=now_year+'年'+now_month+'月'+now_day+'日';
        createCalendar(now_year, now_month, now_day)
        renderHtmlTop(now_year, now_month, now_day)
        details.innerHTML='';
        searchRender(thisDay)
    });
}


//创建日历列表
function createCalendar(year, month, day) {
    var list=[];
    var nstr1=new Date(year,month-1,1),  //当月第一天
        firstDay=nstr1.getDay(),  //当月第一天是星期几
        m_days=[31,Calendar.solarDays(year,2),31,30,31,30,31,31,30,31,30,31] ,//各月份的总天数
        lastMonth='',  //上个月
        lastWeek='',   //上个月的最后一天的星期数
        lastDays='';
    if(month==1){
        lastMonth = 11;
        lastWeek =  new Date(year-1, lastMonth, m_days[lastMonth]).getDay();
        lastDays = m_days[lastMonth]-lastWeek;
    }else{
        lastMonth = month - 1;
        lastWeek = new Date(year,lastMonth-1,m_days[lastMonth-1]).getDay();
        lastDays=m_days[lastMonth-1]-lastWeek;
    }
    var s=1, id=1;
    for(var i=0;i<6;i++) {
        for(var j=0;j<7;j++) {
            var idx = i*7+j;//单元格自然序列号
            var date_str = idx-firstDay +1;//计算日期
            if(date_str<=0) {
                if(month>1 && month <=12){
                    list.push({id:id++,num:lastDays++,isNowMonth:false,month:'last',old:Calendar.solar2lunar(year,month-1,lastDays-1),checked:false});
                } else if(month==1) { //月份为1
                    list.push({id:id++,num:lastDays++,isNowMonth:false,month:'last',old:Calendar.solar2lunar(year-1,12,lastDays-1),checked:false});
                }
            } //下个月开始的几天
            else if(date_str>m_days[lastMonth]){
                if(month<12 && month>=1) {
                    list.push({id:id++,num:s++,isNowMonth:false,month:'next',old:Calendar.solar2lunar(year,month+1,s-1),checked:false});
                } else if( month == 12) { //月份12月
                    list.push({id:id++,num:s++,isNowMonth:false,month:'next',old:Calendar.solar2lunar(year+1,1,s-1),checked:false});
                }
            }//当前月份
            else{
                list.push({id:id++,num:date_str,isNowMonth:true,month:'now',old:Calendar.solar2lunar(year,month,date_str),checked:false});
            }
        }
    }
console.log(list)
    //数据渲染日历
    var content='';
    for (var k=0; k<list.length; k++){
        var arr=list[k];
        if(arr.old.isTerm){
            content += "<li class='"+arr.isNowMonth+" listDay' id='"+arr.id+"' isToday='"+arr.old.isToday+"' data-time='"+arr.old.cYear+"年"+arr.old.cMonth+"月"+arr.old.cDay+"日' checked='"+arr.checked+"'><div class='dayTop'>"+arr.old.cDay+"</div><div class='dayBottom'>"+arr.old.Term+"</div></li>"
        }else{
            content += "<li class='"+arr.isNowMonth+" listDay' id='"+arr.id+"' isToday='"+arr.old.isToday+"' data-time='"+arr.old.cYear+"年"+arr.old.cMonth+"月"+arr.old.cDay+"日' checked='"+arr.checked+"'><div class='dayTop'>"+arr.old.cDay+"</div><div class='dayBottom'>"+arr.old.IDayCn+"</div></li>"
        }
    }
    if(typeof d2 === "undefined"){
       return;
    }else{
        d2.innerHTML=content;
    }




   //选中日期更换头部
    var oli = d2.getElementsByTagName('li');
        for(var z=0; z<oli.length; z++) {
            var aList=list[z];
            (function(z){
               oli[z].onclick=function() {
                   var thisDay=list[z].old.cYear+'年'+list[z].old.cMonth+'月'+list[z].old.cDay+'日';
                   var details=document.getElementsByClassName("details")[0];
                   if (this.classList.contains('true')) {
                       for (var s = 0; s < oli.length; s++) {
                           oli[s].setAttribute("checked", "false");
                           oli[s].setAttribute("isToday", "false");
                       }
                       this.setAttribute("checked", "true");
                       renderHtmlTop(list[z].old.cYear, list[z].old.cMonth,list[z].old.cDay)
                       details.innerHTML='';
                       searchRender(thisDay)
                   };
               }
            })(z)
        }

}
//创建日历头部
function renderHtmlTop(y,m,d) {
    var topBox=document.getElementsByClassName("date")[0];
    var arr=Calendar.solar2lunar(y,m,d)
    var content ='<div class="cDay">' +
        '<span  class="yearMonth left">'+arr.cYear+'年'+arr.cMonth+'月'+arr.cDay+'日</span>' +
        '</div>' +
        '<div class="IDate">' +
        '<div class="iDay">农历 <span class="iDay1">' + arr.IMonthCn+arr.IDayCn +'</span><span class="cWeek"> ' + arr.ncWeek+'</span>'+
        '</div>' +
        '<div class="gzDay">'+arr.gzYear+arr.Animal+'年 '+arr.gzMonth+'月 '+arr.gzDay +'日</div>' +
        '</div>';
    if(typeof topBox=== "undefined"){
        return;
    }
        topBox.innerHTML=content;
}





