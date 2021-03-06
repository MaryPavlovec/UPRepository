/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var timerId;
var changesMade = 0;
var lastChange = 0;
function changeState(st)
	{
		if(st == false)
		{
			document.getElementById('state').className = "btn btn-primary btn-danger";
			document.getElementById('state').innerHTML = "Server is not available";
		}
		else
		{
			document.getElementById('state').className = "btn btn-primary btn-success";
			document.getElementById('state').innerHTML = "Server is available";
		}
	};
	function createMessage(msg,id,nickname,date)
	{
		kDiv = document.createElement('div');
		kDiv.id = id;
	    var aDiv = document.createElement('div');
	    aDiv.className = "chat-box-left";
	    aDiv.innerHTML = msg;
        if(nickname === document.getElementById('nick').value)
            {
                addButtons(aDiv,id);
            }
	    kDiv.appendChild(aDiv);
	    
	    var bDiv = document.createElement('div');
	    bDiv.className = "chat-box-name-left";
	    var image = document.createElement('img');
	    image.src = "http://vladsokolovsky.com/forums/uploads/profile/photo-36.jpg?_r=0";
	    image.alt = "bootstrap Chat box user image";
	    image.className = "img-circle";
	    bDiv.appendChild(image);
		bDiv.innerHTML += date;
	    bDiv.innerHTML += "- ";
	    bDiv.innerHTML += nickname;
	    kDiv.appendChild(bDiv);
		var cDiv = document.createElement('hr');
	    cDiv.className = "hr-clas";                        
        kDiv.appendChild(cDiv);
        document.getElementById('message').value = "";

        document.getElementById('myChat').appendChild(kDiv);
        document.getElementById('myChat').scrollTop = document.getElementById('myChat').scrollHeight;
	}
	function starting()
	{
        setTimeout(getMessages, 3000);
	}
    function startingUsers()
	{ 	
		setInterval(getUsers,3000);
	}
	document.onkeyup=function(e)
	{
		e=e||window.event;
		if(e.keyCode === 13)
		{
			sendClick();
		}
	}
	function getUsers()
	{
		$.ajax({
                        method: 'GET',
                        url:"/Chat/onlineUser",
						success:fillWithUsers,
						error:function(){changeState(false);}
						
                 });
	}
    function fillWithUsers(usersJ)
	{
		changeState(true);
		usersJ=JSON.parse(usersJ);
		users=usersJ.users;
        count = usersJ.token;
        var par = document.getElementById('users');
        par.innerHTML = "";
		$.each(users, function(key,value){
                    if(value != null)
                    {
                        var bDiv = document.createElement('div');
                        bDiv.className = "chat-box-online-left";
                        var image = document.createElement('img');
                        image.src = "http://vladsokolovsky.com/forums/uploads/profile/photo-36.jpg?_r=0";
                        image.alt = "bootstrap Chat box user image";
                        image.className = "img-circle";
                        bDiv.appendChild(image);
                        bDiv.innerHTML += value.user_name;
                        par.appendChild(bDiv);
                        var cDiv = document.createElement('hr');
                        cDiv.className = "hr-clas";  
                        par.appendChild(cDiv);
                        document.getElementById('info').innerHTML = "Online Users(" + count + ")";
                    }
		});
	}
	/*function getMessages()
	{
		$.ajax({
                        method: 'GET',
                        url:"/Chat/msgchat/token=TN"+(((+document.getElementById('kol').value)*8)+11)+"EN",
						success:fillWithMessages,
                        complete: setTimeout(getMessages, 3000)
                 });
	}*/
    function getMessages() {
        var url = '/Chat/msgchat/token=TN' + (((+document.getElementById('kol').value) * 8) + 11) + 'EN';
        ajax("GET", url, null, function(response) {
            fillWithMessages(response);
            getMessages();
        }, function () {changeState(false);});
    }
    function ajax(method, url, data, continueWith, continueWithError) {
        var xhr = new XMLHttpRequest();

        continueWithError = continueWithError || defaultErrorHandler;
        xhr.open(method, url, true);

        xhr.onload = function () {
            if (xhr.readyState !== 4)
                return;
            if (xhr.status != 200 && xhr.status!=304) {
                continueWithError('Error on the server side, response ' + xhr.status);
                return;
            }
            if (isError(xhr.responseText) && xhr.status!=304) {
                continueWithError('Error on the server side, response ' + xhr.responseText);
                return;
            }
            if (continueWith != null) continueWith(xhr.responseText);
        };

        xhr.ontimeout = function () {
            continueWithError('Server timed out !');
        };

        xhr.onerror = function () {
            var errMsg = 'Server connection error !\n\n' + 'Check if \n' + '- server is active\n' +
                '- server sends header "Access-Control-Allow-Origin:*"';

            continueWithError(errMsg);
        };
        xhr.send(data);
    }
    function isError(text) {
        if (text == "")
            return false;
        try {
            var obj = JSON.parse(text);
        } catch (ex) {
            return true;
        }
        return !!obj.error;
    }
	function fillWithMessages(messagesJ)
	{
		changeState(true);
        if (messagesJ == null || messagesJ == "") return;
		messagesJ=JSON.parse(messagesJ);
		messages=messagesJ.messages;
		$.each(messages, function(key,value){
          if(value != null)
          {
                lastChange = value.modification;
                if(value.Text != "")
                {
                    if(document.getElementById(value.messageID)==null)
                    {
                        createMessage(value.Text, value.messageID, value.NickName,value.addedDate);
                    }
                    else
                    {
                        saveEdited(value.messageID,value.Text,value.NickName, value.addedDate);
                    }

                }
                else {
                    deleteMessageDO(value.messageID);
                }
         }
		});
        document.getElementById('kol').value = lastChange;
	}
    function sendClick() 
    {
	$.ajax({
                        method: 'POST',
                        url: '/Chat/chat',
                        data: JSON.stringify({ Text: document.getElementById('message').value,
												NickName: document.getElementById('nick').value,
                                                user_id: document.getElementById('nickID').value,
												addedDate: new Date().toLocaleString()})
        });
		document.getElementById('message').value="";
    };
    function deleteMessage(id)
    {
    	$.ajax({method:'DELETE',
				url:"/Chat/msgchat/id="+id
		});
    };
	function deleteMessageDO(id)
	{
		var b = document.getElementById('myChat');
		element = document.getElementById(id);
		element && element.parentNode.removeChild(element);
	}
	
    function editMessage(id)
    {
    	var elem = document.getElementById(id.slice(1));
    	(element = document.getElementById(id)).parentNode.removeChild(element);
    	var elema = elem.getElementsByClassName("chat-box-left")[0].innerHTML;
    	var message = elema.slice(0,elema.search('<'));
    	elem.getElementsByClassName("chat-box-left")[0].innerHTML = "";
    	var input = document.createElement('input');
    	input.type = "text";
    	input.className = "form-control";
    	input.value = message.trim();
    	input.id = id;
    	var inpGr = document.createElement('input-group');
    	inpGr.appendChild(input);
    	var but = document.createElement('span');
    	but.className = "input-group-btn";
    	var butSave = document.createElement('button');
    	butSave.className = "btn btn-info";
    	butSave.value = "Save";
    	butSave.id = id;
    	butSave.innerHTML = "Save";
    	butSave.addEventListener("click", function(){ save(id); });
    	but.appendChild(butSave);
    	inpGr.appendChild(but);
    	elem.getElementsByClassName("chat-box-left")[0].appendChild(inpGr);
    };
    function save(id)
    {
        id=id.slice(1);
        var elem = document.getElementById(id);
    	var elemt = elem.getElementsByClassName("chat-box-left")[0];
    	var msg = elemt.getElementsByClassName("form-control")[0].value;
        $.ajax({
                        method: 'POST',
                        url: '/Chat/msgchatEdit',
                        data: JSON.stringify({ Text: msg, NickName: document.getElementById('nick').value,addedDate: new Date().toLocaleString(),
												messageID: id})
        });
    };
    function saveEdited(id,text,nick, date)
    {
        var elem = document.getElementById(id);
        if(elem != null)
        {
            elem.getElementsByClassName("chat-box-left")[0].innerHTML = text;
            var elemt = elem.getElementsByClassName("chat-box-name-left")[0];
            elemt.innerHTML = "";
            var image = document.createElement('img');
            image.src = "http://vladsokolovsky.com/forums/uploads/profile/photo-36.jpg?_r=0";
            image.alt = "bootstrap Chat box user image";
            image.className = "img-circle";
            elemt.appendChild(image);
            elemt.innerHTML += date;
            elemt.innerHTML += "- ";
            elemt.innerHTML += nick;
            var elemt2 = elem.getElementsByClassName("chat-box-left")[0];
            if(document.getElementById('nick').value === nick)
                addButtons(elemt2, id);
        }
    }
    function addButtons(prev, id)
    {
	    var buttonRemove = document.createElement('button');
    	buttonRemove.className = "btn pull-right";
    	buttonRemove.id = id;
    	buttonRemove.style.marginTop= "-10px";
    	buttonRemove.addEventListener("click", function(){ deleteMessage(id); });
    	var but = document.createElement('span');
    	but.className = "glyphicon glyphicon-remove";
    	buttonRemove.appendChild(but);
    	prev.appendChild(buttonRemove);

    	var buttonEdit = document.createElement('button');
    	buttonEdit.className = "btn pull-right";
    	buttonEdit.id = 'd'+id;
    	buttonEdit.style.marginTop= "-10px";
    	buttonEdit.addEventListener("click", function(){ editMessage('d'+id); });
    	var but1 = document.createElement('span');
    	but1.className = "glyphicon glyphicon-pencil";
    	buttonEdit.appendChild(but1);
    	prev.appendChild(buttonEdit);

    };
    
    function editNick()
    {
        var elem = document.getElementById('forName');
        var nickname = elem.getElementsByTagName('h4')[0].innerHTML;
        elem.innerHTML = "";
        var input = document.createElement('input');
        input.type = "text";
        input.className = "form-control";
        input.value = nickname.trim();
        input.id = "nickEdit";
        var inpGr = document.createElement('input-group');
        inpGr.appendChild(input);
        var but = document.createElement('span');
        but.className = "input-group-btn";
        var butSave = document.createElement('button');
        butSave.className = "btn btn-info";
        butSave.value = "Save";
        butSave.id = 'saveNick';
        butSave.innerHTML = "Save";
        butSave.addEventListener("click", function(){ saveNick(); });
        but.appendChild(butSave);
        inpGr.appendChild(but);
        elem.appendChild(inpGr);
    };
    function saveNick()
    {
        document.getElementById('nick').value = document.getElementById('nickEdit').value;
        element = document.getElementById('forName');
        element.innerHTML = "";
        var lbl = document.createElement('h4');
        lbl.innerHTML = document.getElementById('nick').value;
        element.appendChild(lbl);
        var buttonEdit = document.createElement('button');
        buttonEdit.className = "btn";
        buttonEdit.innerHTML = "Edit Nick";
        buttonEdit.id = 'editNick';
        buttonEdit.addEventListener("click", function(){ editNick(); });
        document.getElementById('forName').appendChild(buttonEdit);
        document.getElementById('NickName1').innerHTML = document.getElementById('nick').value;
        $.ajax({
                        method: 'POST',
                        url: '/Chat/changeNick',
                        data: JSON.stringify({ NickName: document.getElementById('nick').value, user_id: document.getElementById('nickID').value})
        });
    };
    


