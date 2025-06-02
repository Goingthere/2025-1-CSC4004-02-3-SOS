import yaml
import os

# itad_api_key.yaml 로드
def loadApiKey():
    yaml_path = os.path.join(os.path.dirname(__file__), '../../itad_api_key.yaml')
    with open(yaml_path, 'r') as f:
        config = yaml.safe_load(f)
        return config['isthereanydeal']['api_key']