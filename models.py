from typing import List, Optional
from pydantic import BaseModel


class Setup(BaseModel):
    clone: Optional[bool] = False
    package_manager: Optional[str] = None
    installs : Optional[List[str]] = []
    setup: Optional[str] = None
    sections: List[str] = []




class Repo:

    def __init__(self,
     name,
      url,
      github_data: dict,
      setup=Setup(),
      topics: List[str] = [],
        py_files: List[str] = [],
        inodes: dict = {}
      ):
        self.name = name
        self.url = url
        self.setup = setup
        self.topics = topics
        self.github_data = github_data
        self.inodes = inodes
    
    def serialize(self):
        return {
            "name": self.name,
            "url": self.url,
            "setup": self.setup.dict(),
            "topics": self.topics,
            "indoes": self.inodes
        }