var CommandManager = function(dispatcher) {
	var _undoStack = [];
	var _pointer = -1;

	function addPointer(inc) {
        _pointer += inc;
        dispatcher.trigger("onCommandPointer");
    }

    function poinerUp() { return _pointer >= _undoStack.length - 1; }

    function pointerBottom() { return _pointer < 0; }

	function clearTail() {
		clearTo(_pointer);
    }

    function clearTo(a_pointer)
    {
        let index = a_pointer + 1;
        for (let i = _undoStack.length - 1; i >= index; i--)
            if (_undoStack[i].destroy) _undoStack[i].destroy();

        _undoStack.splice(index, _undoStack.length - index);
        if (_pointer > a_pointer) _pointer = a_pointer;
    }

    function pointerCommand() { return _undoStack.length > 0 ? _undoStack[_pointer] : null; }

    this.clearAll = ()=>{
        clearTo(-1);
    }  

    this.pointerNameCommand = ()=>{
    	return _undoStack.length > 0 ? _undoStack[_pointer].commandName() : ""; 
    }

    this.executeCmd = (command)=>
    {
        if (!poinerUp()) clearTail();

        dispatcher.trigger('onBeforeExecuteCommand', command);
        if (command.execute())
        {   
            //console.log('Execute ' + command.name);
            _undoStack.push(command);
            addPointer(1);
        }
    }

	this.undo = ()=>{
		if ((_undoStack.length > 0) && !pointerBottom())
        {
            let c = pointerCommand();
            if (c) {
                c.undo();
                //console.log('Undo ' + c.name);
            }
            addPointer(-1);
        }
	}

	this.redo = ()=>{
		if ((_undoStack.length > 0) && !poinerUp())
        {
            addPointer(1);
            let c = pointerCommand();
            if (c) {
                c.redo();
                //console.log('Redo ' + c.name);
            }
        }
	}
}

var BaseCommand = function() {
	this.execute = null;
	this.undo = null;
	this.redo = null;
	this.commandName = null;
	this.destroy = null;
}

var commandManager = new CommandManager($(window));