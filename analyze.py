import json
import os;

# Load the JSON data from the file
file_path = os.getcwd() + '/plugin/temp/emotesAll.json'
with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# Define a list of keywords that are often associated with NSFW content
nsfw_keywords = [
    'nsfw', 'sex', 'porn', 'hentai', 'dick', 'penis', 'vagina', 'boobs', 'tits', 'nipple', 'naked', 'nude',
    'fuck', 'fucking', 'bitch', 'shit', 'ass', 'anal', 'orgasm', 'erotic', 'sexual', 'blowjob', 'handjob',
    'masturbate', 'masturbation', 'cock', 'pussy', 'cum', 'jizz', 'sperm', 'bdsm', 'fetish', 'dominatrix',
    'cuck', 'cuckold', 'bdsm', 'spank', 'spanking', 'bondage', 'femdom', 'choke', 'choking', 'slut', 'whore',
    'prostitute', 'escort', 'stripper', 'strip', 'horny', 'aroused', 'seduce', 'seduction', 'foreplay', 'tease',
    'teasing', 'flirt', 'flirting', 'moan', 'moaning', 'grope', 'groping', 'fondle', 'fondling', 'hardcore',
    'softcore', 'erect', 'erection', 'dildo', 'vibrator', 'sextoy', 'sex toy', 'lube', 'lubricant', 'condom',
    'protection', 'safe sex', 'unsafe', 'risque', 'lewd', 'sensual', 'passionate', 'love making', 'make love',
    'kinky', 'kink', 'fetish', 'pervert', 'perverted', 'voyeur', 'exhibitionist', 'swinger', 'orgy', 'threesome',
    'gangbang', 'mmf', 'mff', 'dp', 'double penetration', 'swallow', 'deepthroat', 'gag', 'gagging', 'rimjob',
    'anilingus', 'cunnilingus', 'fellatio', 'squirting', 'golden shower', 'watersports', 'scat', 'pee', 'urine',
    'defecate', 'defecation', 'coprophilia', 'necrophilia', 'bestiality', 'zoophilia', 'incest', 'taboo'
]

# Function to search for NSFW keywords in the new names of the emotes
def search_nsfw_keywords(data):
    nsfw_entries = []
    for entry in data:
        for item in entry:
            new_name = item.get('newn', '').lower()
            if any(kw in new_name for kw in nsfw_keywords):
                nsfw_entries.append(item['newn'])
    return nsfw_entries

# Search for NSFW keywords in the provided JSON data
nsfw_entries = search_nsfw_keywords(data)

print(nsfw_entries)