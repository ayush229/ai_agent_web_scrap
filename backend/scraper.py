from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin, urlparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_website(url, content_type="beautify"):
    """
    Enhanced scraping function with better error handling and logging
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Check if content is HTML
        if 'text/html' not in response.headers.get('Content-Type', ''):
            logger.warning(f"URL {url} returned non-HTML content")
            return {
                "status": "error",
                "error": "URL returned non-HTML content",
                "url": url
            }

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed for {url}: {str(e)}")
        return {
            "status": "error",
            "error": f"Request failed: {str(e)}",
            "url": url
        }

    soup = BeautifulSoup(response.text, 'html.parser')

    if content_type == "raw":
        return {
            "status": "success",
            "url": url,
            "type": "raw",
            "data": soup.prettify()
        }

    # Structured content with headings, paragraphs, images, and links
    content = []
    sections = soup.find_all(['section', 'div', 'article', 'main'])
    
    # If no sections found, treat the whole page as one section
    if not sections:
        sections = [soup]

    for sec in sections:
        section_data = {
            "heading": None,
            "content": [],
            "images": [],
            "links": [],
            "url": url
        }

        # Get the most relevant heading
        heading = sec.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if heading:
            section_data["heading"] = {
                "tag": heading.name,
                "text": heading.get_text(strip=True)
            }

        # Get paragraphs and list items
        paragraphs = sec.find_all(['p', 'li', 'span'])
        for p in paragraphs:
            text = p.get_text(' ', strip=True)
            if text and len(text) > 10:  # Filter out very short texts
                section_data["content"].append(text)

        # Get images with alt text
        for img in sec.find_all("img"):
            src = img.get("src")
            alt = img.get("alt", "").strip()
            if src:
                section_data["images"].append({
                    "src": urljoin(url, src),
                    "alt": alt if alt else None
                })

        # Get links with text
        for a in sec.find_all("a"):
            href = a.get("href")
            if href and not href.startswith(('javascript:', 'mailto:', 'tel:')):
                text = a.get_text(strip=True)
                clean_href = urljoin(url, href.split('#')[0])
                section_data["links"].append({
                    "url": clean_href,
                    "text": text if text else None
                })

        # Only add section if it has meaningful content
        if (section_data["heading"] or 
            section_data["content"] or 
            section_data["images"] or 
            len(section_data["links"]) > 0):
            content.append(section_data)

    return {
        "status": "success",
        "url": url,
        "type": "beautify",
        "data": {
            "sections": content,
            "metadata": {
                "title": soup.title.string if soup.title else None,
                "description": soup.find("meta", attrs={"name": "description"})["content"] 
                              if soup.find("meta", attrs={"name": "description"}) else None
            }
        }
    }

def crawl_website(base_url, content_type="beautify", max_pages=50):
    """
    Enhanced crawling function with better duplicate detection
    """
    visited = set()
    to_visit = [base_url]
    domain = urlparse(base_url).netloc
    all_data = []

    while to_visit and len(visited) < max_pages:
        current_url = to_visit.pop(0)
        
        # Normalize URL to prevent duplicates
        parsed_url = urlparse(current_url)
        normalized_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}".rstrip('/')
        
        if normalized_url in visited:
            continue
            
        visited.add(normalized_url)

        try:
            result = scrape_website(current_url, content_type)
            if result["status"] == "success":
                page_data = {"url": current_url}
                
                if content_type == "raw":
                    page_data["raw_data"] = result["data"]
                else:
                    page_data["content"] = []
                    if "sections" in result["data"]:
                        for section in result["data"]["sections"]:
                            section_content = {
                                "heading": section.get("heading"),
                                "paragraphs": section.get("content", []),
                                "images": section.get("images", [])
                            }
                            page_data["content"].append(section_content)
                            
                            # Add links to crawl queue
                            for link in section.get("links", []):
                                link_url = link["url"] if isinstance(link, dict) else link
                                parsed_link = urlparse(link_url)
                                if (parsed_link.netloc == domain or 
                                    not parsed_link.netloc):  # Relative URL
                                    absolute_link = urljoin(current_url, parsed_link.path)
                                    clean_link = absolute_link.rstrip('/')
                                    if clean_link not in visited and clean_link not in to_visit:
                                        to_visit.append(clean_link)
                all_data.append(page_data)
            else:
                logger.warning(f"Error scraping {current_url}: {result.get('error')}")
                all_data.append({
                    "url": current_url,
                    "error": result.get("error", "Unknown error")
                })
                
        except Exception as e:
            logger.error(f"Error processing {current_url}: {str(e)}")
            all_data.append({
                "url": current_url,
                "error": str(e)
            })

    return {
        "status": "success",
        "url": base_url,
        "type": f"crawl_{content_type}",
        "data": all_data,
        "stats": {
            "pages_crawled": len(visited),
            "pages_failed": len([d for d in all_data if "error" in d])
        }
    }