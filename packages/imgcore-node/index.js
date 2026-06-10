const imgcorenode = require('./build/Release/imgcore_node.node');

function dhashHexwrapper(data, width, height, channels = 4){
	return imgcorenode.dhashHex(data,width,height,channels);
}

module.exports = {dhashHex: dhashHexwrapper};