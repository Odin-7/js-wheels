class RequestPool {
  constructor(maxRequests) {
    this.maxRequests = maxRequests; // 最大并发请求数
    this.currentRequests = 0; // 当前正在进行的请求数
    this.queue = []; // 请求队列
  }

  addRequest(promiseFunc) {
    return new Promise((resolve, reject) => {
      const task = () => {
        this.currentRequests++;
        promiseFunc()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.currentRequests--;
            this.next(); // 请求完成后尝试处理下一个请求
          });
      };

      this.queue.push(task); //入队列
      this.next(); // 尝试处理下一个请求
    });
  }

  next() {
    if (this.currentRequests < this.maxRequests && this.queue.length > 0) {
      const request = this.queue.shift(); //出队列
      request();
    }
  }
}


let requestPool = new RequestPool(5); //并发请求数量

export default requestPool;

// 入池
_requestPool.addRequest(() => {
  return this.$questionAjax.get('/commonController/getAnalyzeGapThemeData?topicId=' + el.id, { pageNum: 1, pageSize: 10 })
    .then(res => {
      el.gapFillingData = res.records
      el.totalPage = res.total
    })
    .finally(() => {
      el.loading = false;
    });
});
