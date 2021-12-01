let pageData = [];
let themeData = [];
let contentData = [];
let pageName = '';
let blogItem = [];
let pageItem = [];
let blogId='';
let IgItem =[];
let pptItem = [];
let sortType = 'timeSort';

//預設渲染畫面
function init(){
    setDataId(); //將資料綁定id 根據時間
    localStorage.setItem('allData',JSON.stringify(data));
    autoRenderByPage();
    renderBlogContent();
    renderLibraryModal();
}

init();

//綁定id
function setDataId(){
let num = 0;
    data.forEach(function(item){
        let year = Number(item.time.split('-')[0]);
        let month = Number(item.time.split('-')[1]) - 1;
        let day = Number(item.time.split('-')[2]);

        let time = new Date(year, month ,day).getTime();
        num += .2; //避免重複
        time += num;
        item.id = time ;
    });

}

//根據頁面顯示資料
function autoRenderByPage(){
    if (document.querySelector('.js-content-list')){
            renderContentList(); //渲染卡片資料
        if(document.querySelectorAll('.js-tags-list')){
            renderTagsList(); //渲染標籤數量＋disabled
        };
        if(document.querySelector('.js-refresh-btn')){
            const refreshBtn = document.querySelector('.js-refresh-btn');
            refreshBtn.addEventListener('click', refreshContent);
        }
    };

}

//渲染卡片
function renderContentList(){
    const contentList = document.querySelector('.js-content-list');
    let str ='';

    if(!contentList.dataset.listType) return ;

    getPageData(contentList);
    //依照時間排序
    if(sortType === 'timeSort'){
        sortByTime(pageData,sortType);
    }else{
        console.log( sortType,'hot'); //還沒新增
    };
    //將pageData 存入localStorage
    updatePageDataLocalStorage();
    if(contentList.dataset.listType==='newestData'){
        const thoughtsList = document.querySelector('.js-data-list');
        pageData = getPageDataLocalStorage();
        let newestData1 = [];
        let newestData2 = [];
        pageData.forEach((item,index) =>{
                if(index >= 0 && index < 3){
                    newestData1.push(item);
                }else if(index >= 3 && index < 6){
                    newestData2.push(item);
                };
        });
        console.log(newestData1);

        str = newPostCardList(newestData1);
        contentList.innerHTML = str;
        str = newPostCardList(newestData2);
        thoughtsList.innerHTML = str;
       
    }else{
        str = renderCardsList(pageData);
        contentList.innerHTML = str;
    }
    
    //監聽按鈕用來開啟頁面內容
    if(document.querySelector('.js-blog-link')){
       const blogLinks = document.querySelectorAll('.js-blog-link');
       blogLinks.forEach(item => item.addEventListener('click',getBlogContentId));
    }
}

//點擊tags 篩選後重新渲染card
function updateContentList(inputData){
    const contentList = document.querySelector('.js-content-list');
    let str ='';
    str = renderCardsList(inputData);
    contentList.innerHTML = str;
}

//渲染tags 標籤＋disable 效果 + 綁監聽
function renderTagsList(){
    const theme = document.querySelector('.js-tags-list[data-tags-type="theme"]');
    //tags 監聽用change 事件不是click
    theme.addEventListener('change', checkboxSelected);
    pageData = getPageDataLocalStorage();

    //更新theme 標籤 disabled 樣式
    theme.querySelectorAll('li input').forEach(inputItem =>{
        inputItem.setAttribute('disabled', '')
        inputItem.dataset.num = 0 ;
            pageData.forEach(item =>{
                item.tagsByTheme.forEach(themeName =>{
                    if(themeName === inputItem.name){
                        inputItem.removeAttribute('disabled', '');
                        inputItem.dataset.num ++ ;
                    }
                })
            })
        
    });

    //更新theme 標籤 數量
    theme.querySelectorAll('li input').forEach(inputItem=>{
        theme.querySelectorAll('li label').forEach(labelItem =>{
            if(labelItem.getAttribute('for') === inputItem.getAttribute('id')){
                labelItem.querySelector('span').textContent = inputItem.dataset.num;
            };
        });
    })

    if(document.querySelector('.js-tags-list[data-tags-type="content"]')){
        const content = document.querySelector('.js-tags-list[data-tags-type="content"]');
        content.addEventListener('change', checkboxSelected);
    

    //更新content 標籤 disabled 樣式
    content.querySelectorAll('li input').forEach(inputItem =>{
        inputItem.setAttribute('disabled', '')
        inputItem.dataset.num = 0 ;
            pageData.forEach(item =>{
                if(item.tagsByContent === inputItem.name){
                    inputItem.removeAttribute('disabled', '');
                    inputItem.dataset.num ++ ;
                }
            })
    });

    //更新content 標籤 數量
    content.querySelectorAll('li input').forEach(inputItem=>{
        content.querySelectorAll('li label').forEach(labelItem =>{
            if(labelItem.getAttribute('for') === inputItem.getAttribute('id')){
                labelItem.querySelector('span').textContent = inputItem.dataset.num;
            };
        });
    })
    };
}
function refreshThemeTagsList(){
    const theme = document.querySelector('.js-tags-list[data-tags-type="theme"]');
    const content = document.querySelector('.js-tags-list[data-tags-type="content"]');
   //移除 checkbox checked  狀態
   theme.querySelectorAll('li input').forEach(inputItem =>{
       inputItem.checked = false;
   });
   content.querySelectorAll('li input').forEach(inputItem =>{
    inputItem.checked = false;
});
}

function updateContentTagsList(inputData){
    const content = document.querySelector('.js-tags-list[data-tags-type="content"]');
     //更新content 標籤 數量dataset
     content.querySelectorAll('li input').forEach(inputItem =>{
        inputItem.dataset.num = 0 ;
            inputData.forEach(item =>{
                if(item.tagsByContent === inputItem.name){
                    inputItem.dataset.num  ++ ;
                }
            })
    });
      //更新content 標籤 數量
      content.querySelectorAll('li input').forEach(inputItem=>{
        content.querySelectorAll('li label').forEach(labelItem =>{
            if(labelItem.getAttribute('for') === inputItem.getAttribute('id')){
                labelItem.querySelector('span').textContent = inputItem.dataset.num;
            };
        });
    });

    //如果content dataset num =0 -> disabled
    content.querySelectorAll('li input').forEach(inputItem =>{
        inputItem.setAttribute('disabled', '');
            if(inputItem.dataset.num >0 ){
                inputItem.removeAttribute('disabled');
            }
    });
}

//get pageData
function getPageData(contentList){
    switch(contentList.dataset.listType){
        case 'all':
        pageName = 'all';
        pageData = data;
        break;  
        case 'learning':
        pageName = 'learning';
        pageData = data.filter(item => item.type[(item.type.findIndex(typename=> typename === '學習思考'))] === '學習思考');
        break;
        case 'architecture':
        pageName = 'architecture';
        pageData = data.filter(item => item.type[(item.type.findIndex(typename=> typename === '建築專區'))] === '建築專區');
        break;
        case 'infoMap':
        pageName = 'infoMap';
        pageData = data.filter(item => item.type[(item.type.findIndex(typename=> typename === '資源整理'))] === '資源整理');
        break;
        case 'library':
        pageName = 'library';
        pageData = data.filter(item => item.type[(item.type.findIndex(typename=> typename === '好書推薦'))] === '好書推薦');
        break;
        case 'newestData':
        pageName = 'newPosts';
        pageData = data.filter(item => item.type[(item.type.findIndex(typename=> typename === '學習思考'))] === '學習思考');
        break;
     }
     updatePageDataLocalStorage();

}
//renderCards
function renderCardsList(pageData){
    let str ='';
    if(pageName === 'library'){
        str = libraryCardList(pageData);
    }else if(pageName === 'newPosts'){
        
    }else{
        str = normalCardList(pageData);
    };
    return str ;
}

//normal content Card list 
//要加上ig 效果
function normalCardList(pageData){
    let str ='';
    pageData.forEach(item =>{
        //要加上 item.time 排序時間
        let content=`<li class="col-8 mx-auto mx-md-0 col-md-6 col-lg-4 mb-8 mb-md-13 px-lg-8" data-tags-theme="${item.tagsByTheme.join('_')}" data-tags-content="${item.tagsByContent}">
        <div class="card content-card h-100">
          <a href="${item.linkUrl}" data-id="${item.id}" class="d-block ${item.tagsByContent === '文章'? 'js-blog-link':''}">
            <img src="${item.imgUrl.length === 0 ? 'https://images.unsplash.com/photo-1546853020-ca4909aef454?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ': item.imgUrl}" alt="card img" class="card-img-top content-card-img-top">
          </a>
          <div class="py-5 px-6 h-100">
            <h3 class="hide-row-2 fs-7 text-primary fw-md mb-2">${item.title}<span class="text-gray-500 fw-normal fs-9 ms-3"> ${regTime(item.time)}</span></h3> 
            <p class="text-secondary hide-row-2 fs-8">${item.description}</p>
          </div>
        </div>
      </li>`;
      str += content;
    });

    return str ;
}
//library content Card list
function libraryCardList(pageData) {
    let str = '';
    pageData.forEach(item =>{
        let content='';
        if(item.tagsByContent=='文章'){
             content = `<li class="col-8 mx-auto mx-md-0 col-md-6 col-lg-4 mb-8 mb-md-13 px-lg-8" data-tags-theme="${item.tagsByTheme.join('_')}" data-tags-content="${item.tagsByContent}" data-id="${item.id}">
            <div class="card content-card h-100">
              <a
                href="${item.linkUrl}"
                data-id="${item.id}"
                class="d-block js-blog-link"
              >
                <img
                  src="${item.imgUrl.length === 0 ? 'https://images.unsplash.com/photo-1546853020-ca4909aef454?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ': item.imgUrl}"
                  alt="card img"
                  class="card-img-top content-card-img-top card-inside-img"
                />
              </a>
              <div class="py-3 px-5 h-100">
                <h3 class="hide-row-2 fs-6 text-primary fw-bold mb-2">
                ${item.title}
                </h3>
                <p class="text-secondary hide-row-2">
                ${item.description}
                </p>
              </div>
            </div>
          </li>
            `;
        }else if(item.tagsByContent=='IG 貼文' || item.tagsByContent=='簡報' ){
            //開啟 modal 的ig 文章
            content =` <li class="col-8 mx-auto mx-md-0 col-md-6 col-lg-4 mb-8 mb-md-13 px-lg-8" data-tags-theme="${item.tagsByTheme.join('_')}" data-tags-content="${item.tagsByContent}" data-id="${item.id}">
            <div class="card content-card h-100">
              <a
                href="#${(item.tagsByContent==='IG 貼文' ? 'libraryIGPostModal':'libraryPPTModal')}"
                data-id="${item.id}"
                class="d-block"
                data-bs-toggle="modal"
                data-bs-target="#${(item.tagsByContent==='IG 貼文' ? 'libraryIGPostModal': 'libraryPPTModal')}"
              >
                <img
                  src="${item.imgUrl.length === 0 ? 'https://images.unsplash.com/photo-1546853020-ca4909aef454?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ': item.imgUrl}"
                  alt="card img"
                  class="card-img-top content-card-img-top card-inside-img"
                />
              </a>
              <div class="py-3 px-5 h-100">
                <h3 class="hide-row-2 fs-6 text-primary fw-bold mb-2">
                ${item.title}
                </h3>
                <p class="text-secondary hide-row-2">
                ${item.description}
                </p>
              </div>
            </div>
          </li>`;
          
        }else{
            //其他如心智圖網頁連結
            content =` <li class="col-8 mx-auto mx-md-0 col-md-6 col-lg-4 mb-8 mb-md-13 px-lg-8" data-tags-theme="${item.tagsByTheme.join('_')}" data-tags-content="${item.tagsByContent}" data-id="${item.id}">
            <div class="card content-card h-100">
              <a
                href="${item.linkUrl}"
                data-id="${item.id}"
                class="d-block"
              >
                <img
                  src="${item.imgUrl.length === 0 ? 'https://images.unsplash.com/photo-1546853020-ca4909aef454?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ': item.imgUrl}"
                  alt="card img"
                  class="card-img-top content-card-img-top card-inside-img"
                />
              </a>
              <div class="py-3 px-5 h-100">
                <h3 class="hide-row-2 fs-6 text-primary fw-bold mb-2">
                ${item.title}
                </h3>
                <p class="text-secondary hide-row-2">
                ${item.description}
                </p>
              </div>
            </div>
          </li>`;
        }
        str += content;
    });

    return str ;
}

//newPost content Card list
function newPostCardList(pageData){
    let str = '';
    pageData.forEach(item =>{
        let content=` <li class="col-8 mx-auto mx-md-0 col-md-6 col-lg-4 mb-5 mb-md-3" data-tags-theme="${item.tagsByTheme.join('_')}" data-tags-content="${item.tagsByContent}" data-id="${item.id}">
        <div class="card content-card h-100">
          <a href="${item.linkUrl}" data-id="${item.id}" class="d-block ${item.tagsByContent === '文章'? 'js-blog-link':''}">
            <img src="${item.imgUrl.length === 0 ? 'https://images.unsplash.com/photo-1546853020-ca4909aef454?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ': item.imgUrl}" class="card-img-top content-card-img-top card-inside-img">
          </a>
          <div class="py-3 px-5 h-100">
            <h3 class="fs-6 text-primary fw-bold mb-2 hide-row-2">${item.title}<span class="text-gray-500 fw-normal fs-9 ms-3"> ${regTime(item.time)}</span></h3> 
            <p class="text-secondary hide-row-2">${item.description}</p>
          </div>
        </div>
      </li>`;
      str += content;
    });

    return str ;
}

//渲染調整時間顯示方式
//顯示上架距離現今的時間
function regTime(time){
    let year = time.split('-')[0];
    let month = time.split('-')[1];
    let day = time.split('-')[2];

    let nowYear = new Date().getFullYear();
    let nowMonth = ((new Date().getMonth() )+ 1 < 10 ? '0': '') + (new Date().getMonth() + 1);
    let nowDay = (new Date().getUTCDate()<10 ? '0' : '') + new Date().getDate();

    if( nowYear - year > 0){
    if( nowMonth - month >= 0){
        return `${nowYear - year} 年前`;
    }else if(nowMonth - month < 0 ){
        return `(${(12- month)+ nowMonth} 個月前`;
    };
    }else if (nowYear - year === 0){
        if(nowMonth - month > 0){
            return `${nowMonth - month} 個月前`;
        }else if(nowMonth - month === 0 ){
            return `${nowDay - day} 天前`;
        };
    };

}

//依照上架順序排序
// 依照上架日期排序
function sortByTime(inputData,sortType){
    inputData.forEach(function(item){
        let nowTime = new Date().getTime();
        item[sortType] = nowTime - item.id;
    });

     inputData.sort((a,b)=> { return a[sortType] - b[sortType]});
}

//tags 篩選資料
function checkboxSelected(e){
    pageData = getPageDataLocalStorage();

   if(this.dataset.tagsType === 'theme'){
    if(e.target.closest('input').checked===true){
        pageData.forEach((item) => {
            item.tagsByTheme.forEach(tagsName =>{
                if(tagsName === e.target.name){
                    themeData.unshift(item);
                };
            })
        });
        //刪除重複的項目
        let newThemeData = new Set(themeData);
        themeData = [...newThemeData];

   }else if(e.target.closest('input').checked === false){
    //刪除點擊取消的tags  
   themeData.forEach(function(updateType){
      updateType.tagsByTheme.forEach(updateTagsName =>{
          if(e.target.name === updateTagsName){
          themeData.splice(themeData.indexOf(updateType),e.target.dataset.num);
          }
      })
  });
  
}
    updateContentList(themeData);
    updateContentTagsList(themeData);
    addClickCheckboxStyle(this);
}else if(this.dataset.tagsType === 'content'){
    if(e.target.closest('input').checked===true){
        themeData.forEach((item) => {
            if(item.tagsByContent === e.target.name){
                contentData.unshift(item);
            };
        });
    }else if(e.target.closest('input').checked === false){
        contentData.forEach(function(updateType){
            if(e.target.name === updateType.tagsByContent){
                contentData.splice(contentData.indexOf(updateType),e.target.dataset.num);
            }
        });
    }
    updateContentList(contentData);
    addClickCheckboxStyle(this);
} 

}
//tags title 加上效果
function addClickCheckboxStyle(vm){
    let num = 0;
    let type = vm.dataset.tagsType;
    vm.querySelectorAll('li input').forEach(inputItem=>{
        if(inputItem.checked === true){
            num++;
        };
    });

    let titleSelected = document.querySelector(`[data-title ="${type}"]`);

    if(num >0){
        titleSelected.classList.remove('link-secondary');
    }else{
        titleSelected.classList.add('link-secondary');
    };

}

//重新篩選按鈕
function refreshContent(e){
    e.preventDefault();
    autoRenderByPage();
    refreshThemeTagsList();

}


//點擊之前得到blog 內容
function getBlogContentId(e){
    e.preventDefault();
    if(pageData.length === 0){
        pageData = data;
    };
    if(blogItem.length !== 0){
        blogItem.splice(0,1);
        localStorage.removeItem(blogContent);
    };
    
    pageData.forEach(item =>{
        if(parseInt(item.id) == parseInt(e.target.closest('a').dataset.id)){
            blogItem.push(item);
        };
    });

    updateBlogLocalStorage();

    loadToPage();
}

//點擊card 後的效果
function loadToPage(){

    window.setTimeout(
        function (){
            window.location.assign("blogContent.html");
            renderBlogContent ();
        },1000); 
}


function renderBlogContent (){
    if(document.querySelector('.js-blog-content')){
        renderInnerContent();
};
}

function renderInnerContent(){
    blogItem = JSON.parse(localStorage.getItem('blogContent'));
    pageName = JSON.parse(localStorage.getItem('pageName'));
    pageItem = JSON.parse(localStorage.getItem('pageData'));
    let allData = JSON.parse(localStorage.getItem('allData'));

    let title = blogItem[0].title;
    let subtitle = blogItem[0].blogContent.subtitle;
    let date = (blogItem[0].time).split('-').join('/');
    let content = blogItem[0].blogContent.content;
    let tags = blogItem[0].blogContent.tags;

    let recommendAry1=[];
    let recommendAry2=[];
    recommendAry1.push(pageItem[0],pageItem[1],pageItem[2]);
    recommendAry2.push(pageItem[3],pageItem[4],pageItem[5]);

    let hotPosts = [];
    let newPosts = [];
    hotPosts.push(allData[0],allData[1],allData[2],allData[3],allData[4]);

    newPosts.push(pageItem[0],pageItem[1],pageItem[2],pageItem[3],pageItem[4]);

    const blogTitleBox = document.querySelector('[data-type="title"]');
    const blogTitle = document.querySelector('[data-blog="title"]');
    const blogSubtitle = document.querySelector('[data-blog="subtitle"]');
    const blogDate = document.querySelectorAll('[data-blog="date"]');
    const blogContent = document.querySelector('[data-blog="content"]');
    const blogFooter = document.querySelector('[data-blog="footer"]');
    const blogFooterTags = document.querySelector('[data-blog="tags"]');
    const recommendTitle = document.querySelector('[data-blog="recommendTitle"]');
    const recommendContentLists = document.querySelectorAll('#carouselRecommendedArea [data-blog]');
    const blogHotPosts = document.querySelector('[data-blog="hotPosts"]');
    const blogNewPosts = document.querySelector('[data-blog="newPosts"]');
    const blogTableContent = document.querySelector('[data-blog="tableContent"]');
    blogTitle.textContent=title;

    if(subtitle.length !==0){
        blogSubtitle.textContent = subtitle;
    }{
        blogTitleBox.removeChild(blogSubtitle);
        blogTitle.classList.add('mb-0');
    };
    blogDate.forEach(item =>{item.textContent = date;});
    blogContent.innerHTML = content;

    if(tags.length !== 0){
        let str = ''
        tags.forEach(item=>{
            let content = `
            <li><a href="${item.url}">${item.name}</a></li>
            `;
            str += content;
        })
        blogFooterTags.innerHTML = str;
    }else{
        blogFooter.removeChild(blogFooterTags);
    };

    recommendTitle.textContent = `「${getPageName(pageName) || blogItem[0].type}」`;
   
    recommendContentLists[0].innerHTML = renderRecommend(recommendAry1);
    recommendContentLists[1].innerHTML = renderRecommend(recommendAry2);
    

    if(hotPosts.length !== 0){
        let str = ''
        hotPosts.forEach(item=>{
            let content = `
            <li class="mb-2">
            <a href="${item.url}" class="link-secondary"
              >${item.title}
            </a>
          </li>
            `;
            str += content;
        })
        blogHotPosts.innerHTML = str;
    };
    if(newPosts.length !== 0){
        let str = ''
        newPosts.forEach(item=>{
            let content = `
            <li class="mb-2">
            <a href="${item.url}" class="link-secondary"
              >${item.title}
            </a>
          </li>
            `;
            str += content;
        })
        blogNewPosts.innerHTML = str;
    };
    if(blogContent.querySelectorAll('[data-title]')){

        let tableTitles = blogContent.querySelectorAll('[data-title]');
        let str ='';
        let h1Num = 0;
        let h2Num = 0;
        let h3Num = 0;
        let h4Num = 0;
        let h5Num = 0;

        tableTitles.forEach(item => {
            switch(item.dataset.title){
                case'h1':
                h1Num++
                h2Num=sortNumberList(h2Num)
                h3Num=sortNumberList(h3Num)
                h4Num=sortNumberList(h4Num)
                h5Num=sortNumberList(h5Num)
                break;
                case'h2':
                h2Num++
                h3Num=sortNumberList(h3Num)
                h4Num=sortNumberList(h4Num)
                h5Num=sortNumberList(h5Num)
                break;
                case'h3':
                h3Num++
                h4Num=sortNumberList(h4Num)
                h5Num=sortNumberList(h5Num)
                break;
                case'h4':
                h4Num++
                h5Num=sortNumberList(h5Num)
                break;
                case'h5':
                h5Num++
                break;
            }

            let titles = `
            <li class="table-content table-content-${item.nodeName.toLocaleLowerCase()}">
                <a href="#${item.id}"
                >${h1Num? h1Num : ''}${h1Num? '.' : ''}${h2Num? h2Num : ''}${h2Num? '.' : ''}${h3Num ? '.' : ''}${h3Num ? h3Num : ''}${h3Num? '.' : ''}${h4Num ? h4Num : ''} ${item.textContent}
                </a>
            </li>
            `;
            str += titles;
        });
        blogTableContent.innerHTML = str;
    };
    
    addBlogLink();

}

function sortNumberList(a){
    if(a!==0){
        a-=a;
    }
    return a
}

function renderRecommend(input){
    let str = '';
    input.forEach(item => {
        let content = `
        <li class="col-md-4 mb-5 mb-md-0">
            <div class="card content-card h-100">
            <a href="blogContent.html" class="d-block js-blog-link" data-id="${item.id}">
                <img
                src="${item.imgUrl.length === 0 ? 'https://images.unsplash.com/photo-1546853020-ca4909aef454?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ': item.imgUrl}"
                alt="card img"
                class="card-img-top content-card-img-top  content-card-img-top-sm"
                />
            </a>
            <div class="py-3 px-5 h-100">
                <h3 class="fs-8 text-primary fw-bold hide-row-2 mb-2">
                ${item.title}
                </h3>
                <p class="text-secondary hide-row-2">
                ${item.description}
                </p>
            </div>
            </div>
        </li>
        `;

        str += content;
    })
    return str;
}

function getPageName(pageName){
    switch(pageName){
        case'all':
        return '';
        break;
        case'newPosts':
        return '最新文章';
        break;
        case'learning':
        return '學習思考';
        break;
        case'architecture':
        return '建築專區';
        break;
        case'infoMap':
        return '資源整理';
        break;
        case'quote':
        return '精選金句';
        break;
        case'library':
        return '好書推薦';
        break;
    }
}

function addBlogLink(){
    //監聽按鈕用來開啟頁面內容
    if(document.querySelector('.js-blog-link')){
        const blogLinks = document.querySelectorAll('.js-blog-link');
        blogLinks.forEach(item => item.addEventListener('click',getBlogContentId));
     }
}

//ig or 簡報 模式
function renderLibraryModal(){
    if(document.querySelector('[data-bs-target]')){
        
        document.querySelectorAll('[data-bs-target="#libraryIGPostModal"]').forEach(item=>{
           item.addEventListener('mouseover', renderIGContentModal);
            });
        document.querySelectorAll('[data-bs-target="#libraryPPTModal"]').forEach(item=>{
            item.addEventListener('mouseover', renderPPTContentModal);
        });
    }
}

//渲染ig 內容
function renderIGContentModal(e){
    let clickId = e.target.closest('a').dataset.id;
    pageData = getPageDataLocalStorage();

    if(IgItem.length !== 0){
        IgItem.splice(0,1);
    };
    pageData.forEach(item =>{
        if(parseInt(item.id) === parseInt(clickId)){
            IgItem.push(item);
        };
    });

    const imgButton = document.querySelector('.js-carousel-button');
    const imgContent = document.querySelector('.js-carousel-itemList');
    const textContent = document.querySelector('.ig-text-content');
    const tagsContent = document.querySelector('.ig-content-tag');
    const createdTime = document.querySelector('.js-ig-time');
    
   
    imgButton.innerHTML = renderModalButton(IgItem[0].igContent.imgUrl);
    imgContent.innerHTML = renderModalImg(IgItem[0].igContent.imgUrl);
    textContent.innerHTML = IgItem[0].igContent.textContent;
    tagsContent.innerHTML = renderTags(IgItem[0].igContent.tagsName);
    createdTime.textContent = regTime(IgItem[0].time);
}

function renderModalButton(inputData){
    let str = `<button
    type="button"
    data-bs-target="#carouselExampleDark"
    data-bs-slide-to="0"
    class="active"
    aria-current="true"
    aria-label="Slide 1"
  ></button>`;

  inputData.shift();
  inputData.forEach((item,index) =>{
        let content = `  <button
        type="button"
        imgUrl ="${item}"
        data-bs-target="#carouselExampleDark"
        data-bs-slide-to="${index+1}"
        aria-label="Slide ${index+2}"
        ></button>`;

       str+=content;
    })
    return str ;
}
function renderModalImg(inputData){
    let str = `<div
    class="
      d-block d-md-none
      text-end
      mt-5
      pe-5
      position-fixed
      top-0
      end-0
    "
    style="z-index: 2001"
  >
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="modal"
      aria-label="Close"
    ></button>
  </div>`;

  let num = 0;
//   let total = inputData.length;
  
  inputData.forEach(item =>{
    num++;
    let content = `<div class="carousel-item ratio ratio-1x1 ${num === 1 ? 'active': ''}" >
    <img src="${item}" alt="post img"
      class="card-inside-img"/></div>`;
    str+= content;
  })
  return str;
}
function renderTags(inputData){
    let str = '';
    inputData.forEach(item =>{
        let content = `<a href="#" data-tag-type="ig" data-tag-name="${item}"
        >${item}</a>`;
        str += content ;
    });

    return str ;
}

//渲染簡報內容
function renderPPTContentModal(e){
    let clickId = e.target.closest('a').dataset.id;
    pageData = getPageDataLocalStorage();

    if(pptItem.length !== 0){
        pptItem.splice(0,1);
    };
    pageData.forEach(item =>{
        if(parseInt(item.id) === parseInt(clickId)){
            pptItem.push(item);
        };
    });

    const pptContentList = document.querySelector('.js-ppt-itemList');
    let str ='';
    pptItem[0].pptContent.forEach((item,index) =>{
        let content = `
        <div class="carousel-item ${index===0?'active':''}">
            <div class="ratio ratio-16x9">
            <img src="${item.imgUrl}"
                alt="ppt img"
                class="card-inside-img"/>
            </div>
            <div class="px-8 py-5 border-top border-gray-500">
                <div class="overflow-auto"  style="height: 50px;">
                <p class="text-black">${item.textContent}</p>
                </div>
            </div>
        </div>
        `
        str += content;
    })

    pptContentList.innerHTML = str ;

}



//localStorage
function updateBlogLocalStorage(){
    localStorage.setItem('blogContent',JSON.stringify(blogItem));
    localStorage.setItem('pageName',JSON.stringify(pageName));
}

function updatePageDataLocalStorage(){
    localStorage.setItem('pageData',JSON.stringify(pageData));
}

function getPageDataLocalStorage(){
    return JSON.parse(localStorage.getItem('pageData'));
}

//搜尋頁面功能
