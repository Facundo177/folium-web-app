#!/usr/bin/env python3
"""
Auditor integral del entorno de trabajo de Folium.
Verifica ramas Git, integridad de código, marcadores de conflicto y estado de sincronización.
"""

import os
import subprocess
import sys
import py_compile

# Forzar salida UTF-8 en terminales de Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

def run_git(repo_path, args):
    try:
        res = subprocess.run(
            ["git", "-C", repo_path] + args,
            capture_output=True,
            text=True,
            check=True
        )
        return res.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"ERROR: {e.stderr.strip()}"

def check_conflicts(repo_path):
    conflicts = []
    marker_start = "<" * 7
    marker_end = ">" * 7
    for root, dirs, files in os.walk(repo_path):
        if ".git" in dirs:
            dirs.remove(".git")
        if "node_modules" in dirs:
            dirs.remove("node_modules")
        for f in files:
            if f.endswith((".js", ".jsx", ".ts", ".tsx", ".py", ".html", ".css", ".json")):
                p = os.path.join(root, f)
                # Omitir el propio script de auditoría
                if os.path.basename(p) == "audit_workspace.py":
                    continue
                try:
                    with open(p, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read()
                        if marker_start in content or marker_end in content:
                            conflicts.append(os.path.relpath(p, repo_path))
                except Exception:
                    pass
    return conflicts

def check_python_syntax(api_path):
    syntax_errors = []
    for root, dirs, files in os.walk(api_path):
        if ".git" in dirs:
            dirs.remove(".git")
        if "__pycache__" in dirs:
            dirs.remove("__pycache__")
        for f in files:
            if f.endswith(".py"):
                p = os.path.join(root, f)
                try:
                    py_compile.compile(p, doraise=True)
                except py_compile.PyCompileError as err:
                    syntax_errors.append((os.path.relpath(p, api_path), str(err)))
    return syntax_errors

def audit_repo(repo_name):
    print(f"\n==================================================")
    print(f"[REPOSITORIO] {repo_name}")
    print(f"==================================================")
    
    if not os.path.isdir(repo_name):
        print(f"[ERROR] Carpeta no encontrada: {repo_name}")
        return False

    # 1. Rama actual
    branch = run_git(repo_name, ["branch", "--show-current"])
    print(f"[*] Rama activa: {branch}")
    if branch != "testing":
        print(f"   [!] ALERTA: No estás en la rama 'testing' (rama esperada para pruebas).")
    else:
        print(f"   [OK] Posicionado correctamente en la rama 'testing'.")

    # 2. Estado de trabajo (uncommitted changes)
    status = run_git(repo_name, ["status", "--porcelain"])
    if status:
        print(f"   [!] Hay cambios sin confirmar en el árbol de trabajo:\n{status}")
    else:
        print(f"   [OK] Árbol de trabajo limpio (sin cambios pendientes).")

    # 3. Sincronización con origin/testing
    remote_status = run_git(repo_name, ["status", "-uno"])
    if "Your branch is up to date" in remote_status:
        print(f"   [OK] Sincronizado con origin/{branch}.")
    elif "Your branch is ahead" in remote_status:
        print(f"   [!] Commits locales pendientes de push a origin/{branch}.")
    elif "Your branch is behind" in remote_status:
        print(f"   [!] Tu rama local está desactualizada respecto a origin/{branch}. Requiere git pull.")

    # 4. Marcadores de conflicto
    conflicts = check_conflicts(repo_name)
    if conflicts:
        print(f"   [ERROR] Se encontraron marcadores de conflicto (<<<<<<<) en:")
        for c in conflicts:
            print(f"      - {c}")
    else:
        print(f"   [OK] Sin marcadores de conflicto de merge residuales.")

    # 5. Si es Python, validar sintaxis
    if "api" in repo_name.lower():
        py_errors = check_python_syntax(repo_name)
        if py_errors:
            print(f"   [ERROR] Errores de sintaxis Python:")
            for path, err in py_errors:
                print(f"      - {path}: {err}")
        else:
            print(f"   [OK] Todos los archivos Python compilan correctamente sin errores.")

    return True

if __name__ == "__main__":
    print(">>> INICIANDO AUDITORIA INTEGRAL DE FOLIUM (TESTING)")
    audit_repo("folium-web-app")
    audit_repo("folium-api")
    print("\n>>> Auditoria completada.")
