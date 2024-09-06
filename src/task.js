class Task {
  constructor(limit = 10, retryLimit = 3, retryDelay = 1000) {
    this.limit = limit;           // 最大同时运行的任务数量
    this.retryLimit = retryLimit; // 最大重试次数
    this.retryDelay = retryDelay; // 重试间隔（毫秒）
    this.tasks = [];              // 任务队列
    this.running = 0;            // 当前正在运行的任务数量
  }

  get Limit() {
    return this.limit
  }
  setLimit(limit) {
    this.limit = limit;
  }

  // 添加任务到队列并尝试运行
  add(taskFn) {
    return new Promise((resolve, reject) => {
      this.tasks.push({ taskFn, resolve, reject, retryCount: 0 });
      this.run();
    });
  }

  // 运行任务的方法，控制并发数量
  async run() {
    while (this.running < this.limit && this.tasks.length) {
      const task = this.tasks.shift();
      if (task) {
        this.running++;
        this.executeTask(task);
      }
    }
  }

  // 执行任务的方法
  async executeTask(task) {
    try {
      const result = await task.taskFn();
      task.resolve(result);
    } catch (error) {
      if (task.retryCount < this.retryLimit) {
        task.retryCount++;
        setTimeout(() => {
          this.tasks.push(task);
          this.run();
        }, this.retryDelay);
      } else {
        task.reject(error);
      }
    } finally {
      this.running--;
      this.run();
    }
  }


}

export default Task;

// 示例任务函数
const exampleTask = () => {
  return new Promise((resolve, reject) => {
    // Simulate a task that randomly succeeds or fails
    setTimeout(() => {
      Math.random() > 0.5 ? resolve('Task completed') : reject('Task failed');
    }, 500);
  });
};

// 使用 Task 类
const taskManager = new Task(5, 3, 1000); // 并发2，最多重试3次，每次重试间隔1秒




for (let index = 0; index < 50; index++) {
  taskManager.add(exampleTask)
    .then(result => console.log(result + index))
    .catch(error => console.error(error + index));

}




