/**
 * Created by Alex on 2016/3/7.
 */
var hzpy = require("./hanziPinyin").hzpy;
var hzpyWithOutYin = require("./hanziPinyinWithoutYin").hzpy;
exports.pinyin = function (word) {
    var str = '';
    var s;
    for (var i = 0; i < word.length; i++) {
        if (hzpy.indexOf(word.charAt(i)) != -1 && word.charCodeAt(i) > 200) {
            s = 1;
            while (hzpy.charAt(hzpy.indexOf(word.charAt(i)) + s) != ",") {
                str += hzpy.charAt(hzpy.indexOf(word.charAt(i)) + s);
                s++;
            }
            str += " ";
        }
        else {
            str += word.charAt(i);
        }
    }
    console.log(str);
    return str;
}
//无声调的拼音
exports.pinyinWithOutYin = function (word) {
    var str = '';
    var s;
    for (var i = 0; i < word.length; i++) {
        if (hzpyWithOutYin.indexOf(word.charAt(i)) != -1 && word.charCodeAt(i) > 200) {
            s = 1;
            while (hzpyWithOutYin.charAt(hzpyWithOutYin.indexOf(word.charAt(i)) + s) != ",") {
                str += hzpyWithOutYin.charAt(hzpyWithOutYin.indexOf(word.charAt(i)) + s);
                s++;
            }
            str += " ";
        }
        else {
            str += word.charAt(i);
        }
    }
    console.log(str);
    return str;
}

exports.isChineseWord = function (word, modle) {
    if (!modle) {
        //modle为false是非严格中文！默认是严格中文
        modle = true;
    }
    var str = '';
    var isChinese = false;
    for (var i = 0; i < word.length; i++) {
        if (hzpy.indexOf(word.charAt(i)) != -1 && word.charCodeAt(i) > 200) {
            isChinese = true;
        }
        else {
            if (modle) {
                return false;
            }
        }
    }
    return isChinese;
}

