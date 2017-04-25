const fs = require('fs');
const http = require('http');
const spawn = require('child_process').spawn;
const crypto = require('crypto');
const write_yaml = require('write-yaml');
const fswrapper = require('../../dist/services/filesystem/index');

const wikipedia = supertest.agent('https://en.wikipedia.org/');
const default_thumbnails = [
  {width:1600,height:900, src:'1600x900.jpg'},
  {width:500,height:500, src:'500x500.jpg'},
  {width:1500,height:750, src:'1500x750.png'},
  {width:500,height:750, src:'500x750.png'}
];
const extnames = ["png", "jpg", "jpeg", "gif"];
const tags = [
  "test-tag-1",
  "test-tag-2",
  "test-tag-3",
  "test-tag-4",
  "test-tag-5",
  "test-tag-6",
  "test-tag-7",
  "test-tag-8",
  "test-tag-9",
  "test-tag-10",
];
const categories = [
  "TestCategory1",
  "TestCategory2",
  "TestCategory3",
  "TestCategory4",
  "TestCategory5",
  "TestCategory6",
  "TestCategory7",
  "TestCategory8",
  "TestCategory9",
  "TestCategory10"
];
const subjects = [
  "TestMusic",
  "TestVisualArts",
  "TestSocialDynamics",
  "TestTravel",
  "TestHealth",
  "TestStartupJourney",
  "TestTech",
  "TestSpirituality",
  "TestFlow"
];

module.exports = function generate(author) {
  var wiki_article;
  var generated_article;
  var folder;
  var absolute_folder;
  return generate_article(author)
  .then((articles) => {
    wiki_article = articles.wiki_article;
    generated_article = articles.generated_article;
    folder = crypto.createHash('md5').update(JSON.stringify(generated_article, 2)).digest("hex");
    absolute_folder = path.join(__dirname, 'tmp', folder);
    return mkdir(absolute_folder);
  }).then(() => {
    return Promise.all([
      create_yaml(absolute_folder, generated_article),
      create_html(absolute_folder, wiki_article.extract),
      copy_thumbnail(generated_article.thumbnail, absolute_folder)
    ]);
  }).then(() => create_archive(folder, path.join(__dirname, 'tmp')))
  .then(() => {
    return {
      clear: clear_files.bind(null, absolute_folder),
      article: generated_article,
      folder: folder
    };
  }).catch((err) => {
    console.log(err);
    return Promise.reject(err);
  });
};

function generate_article(author){
  return wikipedia
    .get('/w/api.php')
    .query({
      action: 'query',
      generator: 'random',
      grnnamespace: 0,
      prop: 'extracts',
      exchars: 5000,
      format: 'json'
    //Process wiki_article and create generated_article
    }).then((res) => {
      if(res.body.query && res.body.query.pages){
        let wiki_article = res.body.query.pages[Object.keys(res.body.query.pages)[0]];
        return Promise.resolve({
          wiki_article: wiki_article,
          generated_article: {
            title: wiki_article.title,
            subject: subjects[Math.floor(Math.random()*subjects.length)],
            category: categories[Math.floor(Math.random()*categories.length)],
            tags: tags.filter(() => Math.round(Math.random())),
            author: author,
            thumbnail: default_thumbnails[Math.floor(Math.random()*default_thumbnails.length)],
            summary: wiki_article.extract.length > 150
                     ? wiki_article.extract.substr(0,150)
                     : wiki_article.extract
          }
        });
      }else{
        return Promise.reject(new Error("Improper format provided"));
      }
    });
}

function mkdir(folder){
  return new Promise((resolve, reject) => {
    fs.mkdir(folder, (err) => {
      if(err) reject(err);
      else resolve(folder);
    });
  });
}

function clear_files(folder) {
  console.log("Clearing old files");
  let promises = [
    fswrapper.remove(folder),
    fswrapper.remove(`${folder}.zip`)
  ];
  return Promise.all(promises);
}
function create_yaml(folder, article){
  return new Promise((resolve, reject) => {
    write_yaml(path.join(folder, 'article.yaml'), article, (err) => {
      if(err) reject(err);
      else resolve();
    });
  });
}

function create_html(folder, content){
  var filepath = path.join(folder, 'index.html');
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, content, function(err) {
      if(err) reject(err);
      resolve();
    });
  }).catch((err) => {
    fs.unlink(filepath);
    console.log(err);
    return Promise.reject(err);
  });
}

function copy_thumbnail(thumbnail, folder) {
  const source = path.join(__dirname, 'images', thumbnail.src);
  const destination = path.join(folder,`thumbnail${path.extname(thumbnail.src)}`);
  return new Promise((resolve, reject) => {
    fswrapper.copy(source, destination, function(err) {
      if(err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
}

function create_archive(source, cwd){
  var zip = spawn('zip', ['-r', `${source}.zip`, source], {cwd: cwd});
  zip.stdout.on('data', (data) => {
    console.log(`unzip stdout:\n${data}`);
  });
  zip.stderr.on('data', (data) => {
    console.log(`zip stderr:\n${data}`);
  });
  return new Promise((resolve, reject) => {
    zip.on('close', (code) => {
      console.log(`zip process exited with code ${code}`);
      if(!code){
        resolve();
      }else{
        let err = new Error(`unzip process exited with code ${code}`);
        err.code = code;
        reject(err);
      }
    });
  });
}
