import Container from "@/components/elements/container"
import Footer from "@/components/layout/footer"
import SearchField from "@/components/elements/search-field";



export interface Resource {
  resourceUsed: string;
  usedFor: string;
  description: string;
  links: string[];
}

const page = () => {
  const resources: Resource[] = [
    {
      resourceUsed: "Ollama",
      usedFor: "Universe Creation",
      description:
        "We are incredibly thankful to everyone who has contributed to Ollama and made such an incredible platform possible.",
      links: [
        "https://ollama.com/",
        "https://ollama.com/library/llama3/blobs/4fa551d4f938"
      ]
    },
    {
      resourceUsed: "Atkinson Hyperlegible",
      usedFor:
        "Atkinson Hyperlegible is used as the main font to keep the product legible for the widest possible audience.",
      description:
        "We appreciate the Braille Institute of America, Applied Design Works, Elliott Scott, Megan Eiswerth, Linus Boman, and Theodore Petrosky for creating Atkinson Hyperlegible and making it available for everyone.",
      links: [
        "https://www.brailleinstitute.org/",
        "https://www.brailleinstitute.org/freefont/",
        "https://www.brailleinstitute.org/privacy-legal/"
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="flex-1  text-white">
        <Container>
          <div className="space-y-4">
            <div className="flex gap-3 items-center">

              <SearchField placeholder={`Search by Resources used`} />
             
            </div>
            {
              resources.map((item: Resource, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 ">
                  <div className="bg-primary/50  backdrop-blur-2xl rounded-2xl p-4 px-6 flex-1 relative ">
                 
                    <h4 className="font-semibold text-md text-white">Resourse used : {item.resourceUsed}</h4>

                    <h4 className="font-semibold text-md text-white">Used For : {item.usedFor}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <h4 className="font-semibold text-md text-white">Links</h4>
                    {item.links.map((link, index) => (

                      <p key={index} className="text-sm text-muted-foreground">
                        {link}
                      </p>
                    ))}
                    <p className="text-xs pt-2 w-full text-end">Last updated: Sep 10, 2025</p>
                  </div>
                </div>
              ))
            }
          </div>

        </Container>
      </div >
      <Footer />
    </div >
  )
}

export default page