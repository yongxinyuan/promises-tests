new Promise((resolve, reject) => {
    resolve('222');
})
    .then((res) => {
        console.log(res);
    });

Promise.resolve(22);