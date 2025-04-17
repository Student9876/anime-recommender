from fastapi import FastAPI


app = FastAPI()


@app.get("/")
def readroot():
    return {'message': 'welcome to backend of anime recommendor'}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, host="0.0.0.0",
        port=8000, log_level="info",
        workers=1, timeout_keep_alive=5
    )
