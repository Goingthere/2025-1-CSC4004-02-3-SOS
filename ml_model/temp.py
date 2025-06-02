import sys
import json

def main():
    if len(sys.argv) > 1:
        jsonPath = sys.argv[1] # json 파일 경로 받아옴
        with open(jsonPath, 'r', encoding='utf-8') as f:
            data = json.load(f) # data 변수에 json 내용 저장


        print("받은 데이터:")
        print(json.dumps(data, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()  