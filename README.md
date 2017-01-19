# wiki-neo4j

## 使用node 爬取百度百科的数据，并存入图形数据库 neo4j
1. node连接neo4j 用的是 node-neo4j,
  献上大神的链接  https://github.com/philippkueng/node-neo4j
  
2. 爬取百度百科用的是 cheerio
  爬取策略：
  首先，选取 某一个百度百科页面作为种子(seed)，获取页面的url和lemmaId，这里注意一下 lemmaId 是用来标注唯一页面的标识；
  然后，分别根据 url和lemmaId发起http请求，请求url可以获得网页内容，并通过cheerio分析页面，获取页面之后的处理方式类似jquery；根据lemmaId，请求百度的异步获取数据的接口，来得到缓冲池的种子集；
  分析完页面后，把目标数据整理为obj待用
  因为 neo4j 存的是 node label 和relation，我这里只存 node，把事先处理好的obj存入 数据库
  
##  因为之前 我的数据库 用的是mongo，原理相同，所以多余的代码 一同奉上。


## 新增we.js 用来为自己写得微信小程序提供数据，数据来源 http://m.pm25.com/ 可是网站已经封了我的ip，反封ip还没有做，算是todo
### 新增pinyin.js 用来转换中文为拼音，用来请求数据使用
