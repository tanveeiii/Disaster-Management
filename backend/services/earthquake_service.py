def process_data(file1, file2, lat, lon):
    path1 = f"uploads/{file1.filename}"
    path2 = f"uploads/{file2.filename}"

    file1.save(path1)
    file2.save(path2)

    result = run_analysis(path1, path2, lat, lon) # run_analysis function is part of the data analysis part

    return result