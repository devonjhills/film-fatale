import os
import re

src_dir = "/Users/devon/film-fatale/src"

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            import_pattern = re.compile(r"import\s+\{([^}]+)\}\s+from\s+[\"']lucide-react[\"'][;\n]?")
            match = import_pattern.search(content)

            if match:
                raw_icons = match.group(1).split(",")
                icons_to_replace = []
                for row in raw_icons:
                    row = row.strip()
                    if not row: continue
                    if " as " in row:
                        alias = row.split(" as ")[1].strip()
                        icons_to_replace.append(alias)
                    else:
                        icons_to_replace.append(row)

                new_content = content[:match.start()] + "import { Icons } from \"@/components/ui/icons\";\n" + content[match.end():]

                for icon in sorted(icons_to_replace, key=len, reverse=True):
                    new_content = re.sub(rf"<{icon}(\s|>)", rf"<Icons.{icon}\1", new_content)
                    new_content = re.sub(rf"</{icon}>", rf"</Icons.{icon}>", new_content)
                    # Protect against prefixing an already prefixed icon or part of another word
                    new_content = re.sub(rf"(?<![A-Za-z0-9_.])({icon})(?![A-Za-z0-9_])", rf"Icons.{icon}", new_content)

                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
