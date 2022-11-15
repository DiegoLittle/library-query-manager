import json
import requests
from bs4 import BeautifulSoup


def queryStackOverflow(query):

    url = (
        "https://api.stackexchange.com/search/advanced?site=stackoverflow.com&q="
        + query
    )
    response = requests.get(url)
    return response.json()


with open("stackoverflow.json", "r") as f:
    res = json.load(f)

links = res["items"]


def parseStackoverflowQuestion(link: str):
    res = requests.get(link)
    soup = BeautifulSoup(res.text, "html.parser")
    question = soup.find("div", {"id": "question"})
    question_code_blocks = question.find_all("code")
    question_code = [block.text for block in question_code_blocks]
    answers = soup.find("div", {"id": "answers"})
    answers = answers.find_all("div", {"class": "answer"})
    answer_code_blocks = []
    for answer in answers:
        answer_code_blocks.append(answer.find_all("code"))
    answer_code = []
    for answer in answer_code_blocks:
        answer_code.append([block.text for block in answer])
    return {"question": question_code, "answers": answer_code}


# parseStackoverflowQuestion("https://stackoverflow.com/questions/70010850/how-to-parse-extract-javascript-class-methods")
# for link in links[:2]:
#     print(link['link'])
