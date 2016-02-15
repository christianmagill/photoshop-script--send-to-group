function moveTo(index) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    desc.putReference(charIDToTypeID('null'), ref);
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID('Lyr '), index);
    desc.putReference(charIDToTypeID('T   '), ref);
    desc.putBoolean(charIDToTypeID('Adjs'), false);
    desc.putInteger(charIDToTypeID('Vrsn'), 5);
    executeAction(charIDToTypeID('move'), desc, DialogModes.NO);
};

function getNumberOfLayers() {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('NmbL'));
    ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    return executeActionGet(ref).getInteger(charIDToTypeID('NmbL'));
};

function getProperty(psClass, psKey, index) { // integer:Class, integer:key
    var ref = new ActionReference();
    if (psKey != undefined) ref.putProperty(charIDToTypeID("Prpr"), psKey);
    if (index != undefined) {
        ref.putIndex(psClass, index);
    } else {
        ref.putEnumerated(psClass, charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    }
    try {
        var desc = executeActionGet(ref);
    } catch (e) {
        return;
    } // return on error
    if (desc.count == 0) return; // return undefined if property doesn't exists
    var dataType = desc.getType(psKey);
    switch (dataType) { // not all types supported - returns undefined if not supported
        case DescValueType.INTEGERTYPE:
            return desc.getInteger(psKey);
            break;
        case DescValueType.ALIASTYPE:
            return desc.getPath(psKey);
            break;
        case DescValueType.BOOLEANTYPE:
            return desc.getBoolean(psKey);
            break;
        case DescValueType.BOOLEANTYPE:
            return desc.getBoolean(psKey);
            break;
        case DescValueType.UNITDOUBLE:
            return desc.getUnitDoubleValue(psKey);
            break;
        case DescValueType.STRINGTYPE:
            return desc.getString(psKey);
            break;
        case DescValueType.OBJECTTYPE:
            return desc.getObjectValue(psKey);
            break;
        case DescValueType.LISTTYPE:
            return desc.getList(psKey);
            break;
        case DescValueType.ENUMERATEDTYPE:
            return desc.getEnumerationValue(psKey);
            break;
    }
};

var doc = app.activeDocument;
if (!doc.activeLayer.isBackgroundLayer) {
    if (doc.layerSets.length > 0) {
        var layerCount = getNumberOfLayers();
        var layerSets = [];
        var setNames = [];
        var loopStart = Number(!doc.layers[doc.layers.length - 1].isBackgroundLayer);
        var layerPath = [];
        var layerPathString = "";
        var layerName = "";

        for (var layerIndex = layerCount; layerIndex >= loopStart; layerIndex--) {

            if (typeIDToStringID(getProperty(charIDToTypeID('Lyr '), stringIDToTypeID('layerSection'), layerIndex)) == 'layerSectionStart') {
                layerSets.push(layerIndex);
                layerName = getProperty(charIDToTypeID('Lyr '), stringIDToTypeID('name'), layerIndex);
                layerPath[layerPath.length] = layerName;
                layerPathString = layerPath.join(' / ');
                setNames.push(layerPathString);

            } else if (typeIDToStringID(getProperty(charIDToTypeID('Lyr '), stringIDToTypeID('layerSection'), layerIndex)) == 'layerSectionEnd') {
                layerPath.pop();
            }
        }

        var win = new Window('dialog', 'Send Layer to Group');
        win.dropdown = win.add("dropdownlist", undefined, setNames);
        win.dropdown.preferredSize.width = 200;
        win.dropdown.items[0].selected = true;
        win.ok = win.add('button', undefined, 'ok');
        var res = win.show();
        if (res == 1) {
            try {
                moveTo(loopStart == 0 ? layerSets[win.dropdown.selection.index] : layerSets[win.dropdown.selection.index] - 1);
            } catch (e) {
                alert('Unable to move selection. Please ensure your selection does not contain a parent of your destination.');
            }
        }
    } else {
        alert('Document does not contain layerSets');
    }
} else {
    alert('You can not move Background');
}