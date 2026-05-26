import os
import tkinter as tk
from tkinter import filedialog, ttk, messagebox

class FileRenamerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Công cụ đổi tên file hàng loạt")
        self.root.geometry("600x500")
        self.root.resizable(True, True)
        
        # Biến
        self.folder_path = tk.StringVar()
        self.base_name = tk.StringVar()
        self.files = []
        
        # Frame chính
        main_frame = ttk.Frame(root, padding=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Section 1: Chọn thư mục
        folder_frame = ttk.LabelFrame(main_frame, text="Chọn thư mục", padding=10)
        folder_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(folder_frame, text="Thư mục chứa file:").grid(row=0, column=0, sticky=tk.W, pady=5)
        ttk.Entry(folder_frame, textvariable=self.folder_path, width=50).grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(folder_frame, text="Duyệt...", command=self.browse_folder).grid(row=0, column=2, padx=5, pady=5)
        
        # Section 2: Nhập tên cơ sở
        name_frame = ttk.LabelFrame(main_frame, text="Cấu hình tên mới", padding=10)
        name_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(name_frame, text="Tên cơ sở:").grid(row=0, column=0, sticky=tk.W, pady=5)
        ttk.Entry(name_frame, textvariable=self.base_name, width=50).grid(row=0, column=1, columnspan=2, padx=5, pady=5)
        ttk.Label(name_frame, text="Ví dụ: dao-nia-mau-trang").grid(row=1, column=1, sticky=tk.W, padx=5)
        
        # Section 3: Danh sách file
        list_frame = ttk.LabelFrame(main_frame, text="Xem trước kết quả", padding=10)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Tạo frame chứa Treeview và scrollbar
        tree_frame = ttk.Frame(list_frame)
        tree_frame.pack(fill=tk.BOTH, expand=True)
        
        # Treeview để hiển thị file
        columns = ("old_name", "new_name")
        self.tree = ttk.Treeview(tree_frame, columns=columns, show="headings")
        self.tree.heading("old_name", text="Tên hiện tại")
        self.tree.heading("new_name", text="Tên mới")
        self.tree.column("old_name", width=250)
        self.tree.column("new_name", width=250)
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL, command=self.tree.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.pack(fill=tk.X, pady=10)
        
        ttk.Button(btn_frame, text="Xem trước", command=self.preview).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Áp dụng đổi tên", command=self.rename_files).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Thoát", command=root.quit).pack(side=tk.RIGHT, padx=5)
        
        # Status bar
        self.status_var = tk.StringVar()
        status_bar = ttk.Label(main_frame, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        status_bar.pack(fill=tk.X, side=tk.BOTTOM, pady=5)
        
        # Mặc định
        self.status_var.set("Sẵn sàng.")
        
    def browse_folder(self):
        folder_selected = filedialog.askdirectory()
        if folder_selected:
            self.folder_path.set(folder_selected)
            self.load_files()
    
    def load_files(self):
        folder = self.folder_path.get()
        try:
            self.files = [f for f in os.listdir(folder) if os.path.isfile(os.path.join(folder, f))]
            self.status_var.set(f"Đã tìm thấy {len(self.files)} file trong thư mục.")
            
            # Tự động xem trước nếu đã có tên cơ sở
            if self.base_name.get():
                self.preview()
                
        except Exception as e:
            self.status_var.set(f"Lỗi: {str(e)}")
            self.files = []
    
    def preview(self):
        base_name = self.base_name.get().strip()
        if not base_name:
            messagebox.showwarning("Cảnh báo", "Vui lòng nhập tên cơ sở!")
            return
            
        if not self.files:
            messagebox.showwarning("Cảnh báo", "Không có file nào để xem trước!")
            return
            
        # Xóa dữ liệu hiện tại
        for item in self.tree.get_children():
            self.tree.delete(item)
            
        # Thêm dữ liệu mới
        multiple_files = len(self.files) > 1
        
        for i, file in enumerate(self.files):
            # Lấy phần mở rộng file
            _, extension = os.path.splitext(file)
            
            # Tạo tên mới
            if multiple_files:
                new_name = f"{base_name}-{i+1}{extension}"
            else:
                new_name = f"{base_name}{extension}"
                
            self.tree.insert("", tk.END, values=(file, new_name))
            
        self.status_var.set("Xem trước hoàn tất. Kiểm tra trước khi áp dụng.")
    
    def rename_files(self):
        if not self.tree.get_children():
            messagebox.showwarning("Cảnh báo", "Hãy xem trước trước khi áp dụng đổi tên!")
            return
            
        folder = self.folder_path.get()
        
        # Xác nhận
        confirm = messagebox.askyesno("Xác nhận", "Bạn có chắc chắn muốn đổi tên các file này?")
        if not confirm:
            return
            
        # Thực hiện đổi tên
        success_count = 0
        error_count = 0
        
        for item in self.tree.get_children():
            old_name, new_name = self.tree.item(item, "values")
            try:
                os.rename(
                    os.path.join(folder, old_name),
                    os.path.join(folder, new_name)
                )
                success_count += 1
            except Exception as e:
                error_count += 1
                self.status_var.set(f"Lỗi khi đổi tên {old_name}: {str(e)}")
                
        # Thông báo kết quả
        if error_count == 0:
            messagebox.showinfo("Hoàn tất", f"Đã đổi tên thành công {success_count} file!")
        else:
            messagebox.showwarning("Hoàn tất với lỗi", 
                                 f"Đã đổi tên {success_count} file, {error_count} file bị lỗi.")
            
        # Làm mới danh sách file
        self.load_files()

if __name__ == "__main__":
    root = tk.Tk()
    app = FileRenamerApp(root)
    root.mainloop()