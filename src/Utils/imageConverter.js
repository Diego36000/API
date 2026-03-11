function fileToBase64(file) {
    if (!file) {
        return null;
    }
    return file.buffer.toString('base64');
}

function base64ToBuffer(base64String) {
    if (!base64String) {
        return null;
    }
    return Buffer.from(base64String, 'base64');
}

function bufferToBase64(buffer) {
    if (!buffer) {
        return null;
    }
    return buffer.toString('base64');
}

export default {
    fileToBase64,
    base64ToBuffer,
    bufferToBase64
};
