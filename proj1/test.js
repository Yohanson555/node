async function test1(){
    console.log(new Date());

    await new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Hello world');
            resolve();
        }, 1000);
    });

    console.log(new Date());
    console.log('Hello');
}

test1();